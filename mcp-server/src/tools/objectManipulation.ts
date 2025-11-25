/**
 * Advanced Object Manipulation Tools
 *
 * Tools for cloning, moving, and manipulating scene objects.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js'
import type { SceneBridge } from '../bridge/websocket.js'

/**
 * Object manipulation tool definitions
 */
export const objectManipulationTools: Tool[] = [
  {
    name: 'clone_object',
    description:
      'Clone an existing object with optional position offset. Creates an exact copy with a new ID.',
    inputSchema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'ID of object to clone',
        },
        newId: {
          type: 'string',
          description: 'ID for the cloned object (auto-generated if not provided)',
        },
        offset: {
          type: 'array',
          items: { type: 'number' },
          description: 'Position offset [x, y, z] from original (default: [1, 0, 0])',
        },
        cloneChildren: {
          type: 'boolean',
          description: 'Also clone child objects (for groups)',
          default: true,
        },
      },
      required: ['objectId'],
    },
  },
  {
    name: 'move_object',
    description:
      'Move an object by changing its position, rotation, or scale. Supports relative and absolute movements.',
    inputSchema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'ID of object to move',
        },
        position: {
          type: 'array',
          items: { type: 'number' },
          description: 'New position [x, y, z]',
        },
        rotation: {
          type: 'array',
          items: { type: 'number' },
          description: 'New rotation [x, y, z] in radians',
        },
        scale: {
          type: 'array',
          items: { type: 'number' },
          description: 'New scale [x, y, z]',
        },
        relative: {
          type: 'boolean',
          description: 'Apply as relative change (add to current) vs absolute',
          default: false,
        },
      },
      required: ['objectId'],
    },
  },
  {
    name: 'show_object',
    description: 'Make an object visible (set visible: true).',
    inputSchema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'ID of object to show',
        },
      },
      required: ['objectId'],
    },
  },
  {
    name: 'hide_object',
    description: 'Make an object invisible (set visible: false).',
    inputSchema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'ID of object to hide',
        },
      },
      required: ['objectId'],
    },
  },
  {
    name: 'rename_object',
    description: 'Change the name of an object (does not change ID).',
    inputSchema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'ID of object to rename',
        },
        newName: {
          type: 'string',
          description: 'New name for the object',
        },
      },
      required: ['objectId', 'newName'],
    },
  },
  {
    name: 'duplicate_object',
    description:
      'Duplicate an object multiple times in a pattern (grid, circle, line).',
    inputSchema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'ID of object to duplicate',
        },
        count: {
          type: 'number',
          description: 'Number of duplicates to create',
          default: 1,
        },
        pattern: {
          type: 'string',
          enum: ['line', 'grid', 'circle'],
          description: 'Duplication pattern',
          default: 'line',
        },
        spacing: {
          type: 'number',
          description: 'Spacing between duplicates',
          default: 1.0,
        },
      },
      required: ['objectId'],
    },
  },
]

/**
 * Handle clone_object tool
 */
export async function handleCloneObject(args: any, sceneBridge: SceneBridge) {
  try {
    const snapshot = await sceneBridge.getSnapshot()
    const { objectId, newId, offset = [1, 0, 0], cloneChildren = true } = args

    const obj = snapshot.objects?.find((o: any) => o.id === objectId)
    if (!obj) {
      return {
        content: [{ type: 'text', text: `Object '${objectId}' not found` }],
        isError: true,
      }
    }

    // Create clone
    const clone = JSON.parse(JSON.stringify(obj))
    clone.id = newId || `${objectId}_clone_${Date.now()}`

    // Apply offset
    clone.transform.position = [
      obj.transform.position[0] + offset[0],
      obj.transform.position[1] + offset[1],
      obj.transform.position[2] + offset[2],
    ]

    // Handle children
    if (!cloneChildren && clone.children) {
      delete clone.children
    } else if (cloneChildren && clone.children) {
      // Generate new IDs for children
      clone.children = clone.children.map((child: any, index: number) => {
        const childClone = JSON.parse(JSON.stringify(child))
        childClone.id = `${clone.id}_child_${index}`
        return childClone
      })
    }

    // Send create command
    await sceneBridge.send({
      command: 'create_object',
      object: clone,
    })

    return {
      content: [
        {
          type: 'text',
          text: `Object cloned successfully:\nOriginal: ${objectId}\nClone: ${clone.id}\nPosition: [${clone.transform.position.join(', ')}]`,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error cloning object: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Handle move_object tool
 */
export async function handleMoveObject(args: any, sceneBridge: SceneBridge) {
  try {
    const snapshot = await sceneBridge.getSnapshot()
    const { objectId, position, rotation, scale, relative = false } = args

    const obj = snapshot.objects?.find((o: any) => o.id === objectId)
    if (!obj) {
      return {
        content: [{ type: 'text', text: `Object '${objectId}' not found` }],
        isError: true,
      }
    }

    const updates: any = {}

    if (position) {
      if (relative) {
        updates.position = [
          obj.transform.position[0] + position[0],
          obj.transform.position[1] + position[1],
          obj.transform.position[2] + position[2],
        ]
      } else {
        updates.position = position
      }
    }

    if (rotation) {
      if (relative) {
        updates.rotation = [
          obj.transform.rotation[0] + rotation[0],
          obj.transform.rotation[1] + rotation[1],
          obj.transform.rotation[2] + rotation[2],
        ]
      } else {
        updates.rotation = rotation
      }
    }

    if (scale) {
      if (relative) {
        updates.scale = [
          obj.transform.scale[0] * scale[0],
          obj.transform.scale[1] * scale[1],
          obj.transform.scale[2] * scale[2],
        ]
      } else {
        updates.scale = scale
      }
    }

    // Send update command
    await sceneBridge.send({
      command: 'edit_object',
      objectId,
      updates,
    })

    return {
      content: [
        {
          type: 'text',
          text: `Object '${objectId}' moved successfully:\n${JSON.stringify(updates, null, 2)}`,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error moving object: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Handle show_object tool
 */
export async function handleShowObject(args: any, sceneBridge: SceneBridge) {
  try {
    const { objectId } = args

    await sceneBridge.send({
      command: 'edit_object',
      objectId,
      updates: { visible: true },
    })

    return {
      content: [
        {
          type: 'text',
          text: `Object '${objectId}' is now visible`,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error showing object: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Handle hide_object tool
 */
export async function handleHideObject(args: any, sceneBridge: SceneBridge) {
  try {
    const { objectId } = args

    await sceneBridge.send({
      command: 'edit_object',
      objectId,
      updates: { visible: false },
    })

    return {
      content: [
        {
          type: 'text',
          text: `Object '${objectId}' is now hidden`,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error hiding object: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Handle rename_object tool
 */
export async function handleRenameObject(args: any, sceneBridge: SceneBridge) {
  try {
    const { objectId, newName } = args

    await sceneBridge.send({
      command: 'edit_object',
      objectId,
      updates: { name: newName },
    })

    return {
      content: [
        {
          type: 'text',
          text: `Object '${objectId}' renamed to '${newName}'`,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error renaming object: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Handle duplicate_object tool
 */
export async function handleDuplicateObject(args: any, sceneBridge: SceneBridge) {
  try {
    const snapshot = await sceneBridge.getSnapshot()
    const { objectId, count = 1, pattern = 'line', spacing = 1.0 } = args

    const obj = snapshot.objects?.find((o: any) => o.id === objectId)
    if (!obj) {
      return {
        content: [{ type: 'text', text: `Object '${objectId}' not found` }],
        isError: true,
      }
    }

    const created: string[] = []

    for (let i = 0; i < count; i++) {
      const clone = JSON.parse(JSON.stringify(obj))
      clone.id = `${objectId}_dup_${i + 1}_${Date.now()}`

      let offset = [0, 0, 0]

      switch (pattern) {
        case 'line':
          offset = [(i + 1) * spacing, 0, 0]
          break
        case 'grid':
          const cols = Math.ceil(Math.sqrt(count))
          const row = Math.floor(i / cols)
          const col = i % cols
          offset = [col * spacing, 0, row * spacing]
          break
        case 'circle':
          const angle = ((i + 1) / count) * Math.PI * 2
          const radius = spacing
          offset = [Math.cos(angle) * radius, 0, Math.sin(angle) * radius]
          break
      }

      clone.transform.position = [
        obj.transform.position[0] + offset[0],
        obj.transform.position[1] + offset[1],
        obj.transform.position[2] + offset[2],
      ]

      await sceneBridge.send({
        command: 'create_object',
        object: clone,
      })

      created.push(clone.id)
    }

    return {
      content: [
        {
          type: 'text',
          text: `Created ${count} duplicates of '${objectId}' in ${pattern} pattern:\n${created.join('\n')}`,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error duplicating object: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Main object manipulation tool handler
 */
export async function handleObjectManipulationTool(
  name: string,
  args: any,
  sceneBridge: SceneBridge
) {
  switch (name) {
    case 'clone_object':
      return await handleCloneObject(args, sceneBridge)
    case 'move_object':
      return await handleMoveObject(args, sceneBridge)
    case 'show_object':
      return await handleShowObject(args, sceneBridge)
    case 'hide_object':
      return await handleHideObject(args, sceneBridge)
    case 'rename_object':
      return await handleRenameObject(args, sceneBridge)
    case 'duplicate_object':
      return await handleDuplicateObject(args, sceneBridge)
    default:
      return {
        content: [
          { type: 'text', text: `Unknown object manipulation tool: ${name}` },
        ],
        isError: true,
      }
  }
}
