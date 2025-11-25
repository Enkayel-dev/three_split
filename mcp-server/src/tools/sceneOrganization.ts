/**
 * Scene Organization Tools
 *
 * Tools for organizing objects into groups and managing scene structure.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js'
import type { SceneBridge } from '../bridge/websocket.js'

/**
 * Scene organization tool definitions
 */
export const sceneOrganizationTools: Tool[] = [
  {
    name: 'create_group',
    description:
      'Create a new group object that can contain other objects. Groups help organize related objects.',
    inputSchema: {
      type: 'object',
      properties: {
        groupId: {
          type: 'string',
          description: 'ID for the new group',
        },
        name: {
          type: 'string',
          description: 'Name for the group',
        },
        position: {
          type: 'array',
          items: { type: 'number' },
          description: 'Position [x, y, z] (default: [0, 0, 0])',
        },
        objectIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Initial objects to add to the group (optional)',
        },
      },
      required: ['groupId'],
    },
  },
  {
    name: 'add_to_group',
    description: 'Add one or more objects to an existing group.',
    inputSchema: {
      type: 'object',
      properties: {
        groupId: {
          type: 'string',
          description: 'ID of the group',
        },
        objectIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Object IDs to add to the group',
        },
      },
      required: ['groupId', 'objectIds'],
    },
  },
  {
    name: 'remove_from_group',
    description: 'Remove one or more objects from a group.',
    inputSchema: {
      type: 'object',
      properties: {
        groupId: {
          type: 'string',
          description: 'ID of the group',
        },
        objectIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Object IDs to remove from the group',
        },
      },
      required: ['groupId', 'objectIds'],
    },
  },
  {
    name: 'list_groups',
    description: 'List all groups in the scene with their members.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'ungroup',
    description:
      'Dissolve a group, moving all child objects to the root level. The group is deleted.',
    inputSchema: {
      type: 'object',
      properties: {
        groupId: {
          type: 'string',
          description: 'ID of the group to ungroup',
        },
        maintainWorldPosition: {
          type: 'boolean',
          description:
            'Maintain world position of children when moving to root (default: true)',
          default: true,
        },
      },
      required: ['groupId'],
    },
  },
  {
    name: 'get_group_bounds',
    description:
      'Calculate the bounding box that contains all objects in a group.',
    inputSchema: {
      type: 'object',
      properties: {
        groupId: {
          type: 'string',
          description: 'ID of the group',
        },
      },
      required: ['groupId'],
    },
  },
]

/**
 * Handle create_group tool
 */
export async function handleCreateGroup(args: any, sceneBridge: SceneBridge) {
  try {
    const { groupId, name, position = [0, 0, 0], objectIds = [] } = args

    const group: any = {
      id: groupId,
      type: 'group',
      name: name || groupId,
      transform: {
        position,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
      visible: true,
      children: [],
    }

    // If objectIds provided, we'll need to fetch them and add as children
    if (objectIds.length > 0) {
      const snapshot = await sceneBridge.getSnapshot()

      for (const objectId of objectIds) {
        const obj = snapshot.objects?.find((o: any) => o.id === objectId)
        if (obj) {
          // Clone the object as a child
          const child = JSON.parse(JSON.stringify(obj))
          group.children.push(child)

          // Delete the original object (it's now in the group)
          await sceneBridge.send({
            command: 'delete_object',
            objectId,
          })
        }
      }
    }

    // Create the group
    await sceneBridge.send({
      command: 'create_object',
      object: group,
    })

    return {
      content: [
        {
          type: 'text',
          text: `Group '${groupId}' created with ${group.children.length} objects`,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error creating group: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Handle add_to_group tool
 */
export async function handleAddToGroup(args: any, sceneBridge: SceneBridge) {
  try {
    const snapshot = await sceneBridge.getSnapshot()
    const { groupId, objectIds } = args

    const group = snapshot.objects?.find((o: any) => o.id === groupId)
    if (!group) {
      return {
        content: [{ type: 'text', text: `Group '${groupId}' not found` }],
        isError: true,
      }
    }

    if (group.type !== 'group') {
      return {
        content: [
          { type: 'text', text: `Object '${groupId}' is not a group` },
        ],
        isError: true,
      }
    }

    const added: string[] = []

    for (const objectId of objectIds) {
      const obj = snapshot.objects?.find((o: any) => o.id === objectId)
      if (obj) {
        // Clone object as child
        const child = JSON.parse(JSON.stringify(obj))

        // Add to group's children
        const children = group.children || []
        children.push(child)

        await sceneBridge.send({
          command: 'edit_object',
          objectId: groupId,
          updates: { children },
        })

        // Delete original
        await sceneBridge.send({
          command: 'delete_object',
          objectId,
        })

        added.push(objectId)
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: `Added ${added.length} objects to group '${groupId}':\n${added.join('\n')}`,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error adding to group: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Handle remove_from_group tool
 */
export async function handleRemoveFromGroup(args: any, sceneBridge: SceneBridge) {
  try {
    const snapshot = await sceneBridge.getSnapshot()
    const { groupId, objectIds } = args

    const group = snapshot.objects?.find((o: any) => o.id === groupId)
    if (!group) {
      return {
        content: [{ type: 'text', text: `Group '${groupId}' not found` }],
        isError: true,
      }
    }

    if (group.type !== 'group') {
      return {
        content: [
          { type: 'text', text: `Object '${groupId}' is not a group` },
        ],
        isError: true,
      }
    }

    const removed: string[] = []

    for (const objectId of objectIds) {
      const child = group.children?.find((c: any) => c.id === objectId)
      if (child) {
        // Create as root object
        await sceneBridge.send({
          command: 'create_object',
          object: child,
        })

        // Remove from group
        const children = group.children.filter((c: any) => c.id !== objectId)
        await sceneBridge.send({
          command: 'edit_object',
          objectId: groupId,
          updates: { children },
        })

        removed.push(objectId)
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: `Removed ${removed.length} objects from group '${groupId}':\n${removed.join('\n')}`,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error removing from group: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Handle list_groups tool
 */
export async function handleListGroups(sceneBridge: SceneBridge) {
  try {
    const snapshot = await sceneBridge.getSnapshot()
    const groups = snapshot.objects?.filter((o: any) => o.type === 'group') || []

    const groupInfo = groups.map((group: any) => ({
      id: group.id,
      name: group.name,
      position: group.transform.position,
      childCount: group.children?.length || 0,
      children: group.children?.map((c: any) => ({
        id: c.id,
        name: c.name,
        type: c.type,
      })) || [],
    }))

    return {
      content: [
        {
          type: 'text',
          text: `Found ${groups.length} groups:\n\n${JSON.stringify(groupInfo, null, 2)}`,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error listing groups: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Handle ungroup tool
 */
export async function handleUngroup(args: any, sceneBridge: SceneBridge) {
  try {
    const snapshot = await sceneBridge.getSnapshot()
    const { groupId, maintainWorldPosition = true } = args

    const group = snapshot.objects?.find((o: any) => o.id === groupId)
    if (!group) {
      return {
        content: [{ type: 'text', text: `Group '${groupId}' not found` }],
        isError: true,
      }
    }

    if (group.type !== 'group') {
      return {
        content: [
          { type: 'text', text: `Object '${groupId}' is not a group` },
        ],
        isError: true,
      }
    }

    const children = group.children || []
    const moved: string[] = []

    // Move children to root
    for (const child of children) {
      if (maintainWorldPosition) {
        // Calculate world position (group position + child local position)
        child.transform.position = [
          group.transform.position[0] + child.transform.position[0],
          group.transform.position[1] + child.transform.position[1],
          group.transform.position[2] + child.transform.position[2],
        ]
      }

      await sceneBridge.send({
        command: 'create_object',
        object: child,
      })

      moved.push(child.id)
    }

    // Delete the group
    await sceneBridge.send({
      command: 'delete_object',
      objectId: groupId,
    })

    return {
      content: [
        {
          type: 'text',
          text: `Group '${groupId}' ungrouped. ${moved.length} objects moved to root:\n${moved.join('\n')}`,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error ungrouping: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Handle get_group_bounds tool
 */
export async function handleGetGroupBounds(args: any, sceneBridge: SceneBridge) {
  try {
    const snapshot = await sceneBridge.getSnapshot()
    const { groupId } = args

    const group = snapshot.objects?.find((o: any) => o.id === groupId)
    if (!group) {
      return {
        content: [{ type: 'text', text: `Group '${groupId}' not found` }],
        isError: true,
      }
    }

    if (group.type !== 'group' || !group.children || group.children.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `Group '${groupId}' has no children to calculate bounds`,
          },
        ],
        isError: true,
      }
    }

    // Calculate bounding box
    let minX = Infinity, minY = Infinity, minZ = Infinity
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity

    for (const child of group.children) {
      const [x, y, z] = child.transform.position
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      minZ = Math.min(minZ, z)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
      maxZ = Math.max(maxZ, z)
    }

    const center = [
      (minX + maxX) / 2,
      (minY + maxY) / 2,
      (minZ + maxZ) / 2,
    ]

    const size = [
      maxX - minX,
      maxY - minY,
      maxZ - minZ,
    ]

    return {
      content: [
        {
          type: 'text',
          text: `Group '${groupId}' bounds:\n\nMin: [${minX.toFixed(2)}, ${minY.toFixed(2)}, ${minZ.toFixed(2)}]\nMax: [${maxX.toFixed(2)}, ${maxY.toFixed(2)}, ${maxZ.toFixed(2)}]\nCenter: [${center[0].toFixed(2)}, ${center[1].toFixed(2)}, ${center[2].toFixed(2)}]\nSize: [${size[0].toFixed(2)}, ${size[1].toFixed(2)}, ${size[2].toFixed(2)}]`,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error getting group bounds: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Main scene organization tool handler
 */
export async function handleSceneOrganizationTool(
  name: string,
  args: any,
  sceneBridge: SceneBridge
) {
  switch (name) {
    case 'create_group':
      return await handleCreateGroup(args, sceneBridge)
    case 'add_to_group':
      return await handleAddToGroup(args, sceneBridge)
    case 'remove_from_group':
      return await handleRemoveFromGroup(args, sceneBridge)
    case 'list_groups':
      return await handleListGroups(sceneBridge)
    case 'ungroup':
      return await handleUngroup(args, sceneBridge)
    case 'get_group_bounds':
      return await handleGetGroupBounds(args, sceneBridge)
    default:
      return {
        content: [
          { type: 'text', text: `Unknown scene organization tool: ${name}` },
        ],
        isError: true,
      }
  }
}
