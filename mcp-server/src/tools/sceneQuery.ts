/**
 * Scene Query and Inspection Tools
 *
 * Advanced tools for querying and inspecting scene structure.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js'
import type { SceneBridge } from '../bridge/websocket.js'

/**
 * Scene query tool definitions
 */
export const sceneQueryTools: Tool[] = [
  {
    name: 'query_scene',
    description:
      'Advanced scene querying with filters. Find objects by type, name, position, visibility, or custom criteria.',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: 'Filter by object type (GlassButton, GlassCard, GlassPanel, mesh, group)',
        },
        namePattern: {
          type: 'string',
          description: 'Filter by name pattern (supports wildcards: *)',
        },
        visible: {
          type: 'boolean',
          description: 'Filter by visibility',
        },
        hasInteractions: {
          type: 'boolean',
          description: 'Filter objects with interactions',
        },
        hasAnimations: {
          type: 'boolean',
          description: 'Filter objects with animations',
        },
        inGroup: {
          type: 'string',
          description: 'Filter objects in a specific group',
        },
      },
    },
  },
  {
    name: 'get_scene_stats',
    description:
      'Get comprehensive statistics about the scene: object counts by type, total vertices, materials used, etc.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'update_scene_metadata',
    description:
      'Update scene metadata (name, description, author, tags). Does not modify objects.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Scene name',
        },
        description: {
          type: 'string',
          description: 'Scene description',
        },
        author: {
          type: 'string',
          description: 'Scene author',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Scene tags',
        },
      },
    },
  },
  {
    name: 'find_objects_near',
    description:
      'Find all objects within a certain distance of a position or another object.',
    inputSchema: {
      type: 'object',
      properties: {
        position: {
          type: 'array',
          items: { type: 'number' },
          description: 'Position [x, y, z] to search around',
        },
        objectId: {
          type: 'string',
          description: 'Or search around an existing object',
        },
        radius: {
          type: 'number',
          description: 'Search radius',
          default: 2.0,
        },
      },
    },
  },
  {
    name: 'get_object_hierarchy',
    description:
      'Get the full hierarchy tree for an object, including all children and ancestors.',
    inputSchema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'Object ID to get hierarchy for',
        },
      },
      required: ['objectId'],
    },
  },
]

/**
 * Handle query_scene tool
 */
export async function handleQueryScene(args: any, sceneBridge: SceneBridge) {
  try {
    const snapshot = await sceneBridge.getSnapshot()
    const { type, namePattern, visible, hasInteractions, hasAnimations, inGroup } = args

    let results = snapshot.objects || []

    // Filter by type
    if (type) {
      results = results.filter((obj: any) => obj.type === type)
    }

    // Filter by name pattern
    if (namePattern) {
      const regex = new RegExp(
        '^' + namePattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$',
        'i'
      )
      results = results.filter((obj: any) => obj.name && regex.test(obj.name))
    }

    // Filter by visibility
    if (visible !== undefined) {
      results = results.filter((obj: any) => obj.visible === visible)
    }

    // Filter by interactions
    if (hasInteractions !== undefined) {
      results = results.filter((obj: any) =>
        hasInteractions ? obj.interactions : !obj.interactions
      )
    }

    // Filter by animations
    if (hasAnimations !== undefined) {
      results = results.filter((obj: any) =>
        hasAnimations ? obj.animations : !obj.animations
      )
    }

    // Filter by group membership
    if (inGroup) {
      results = results.filter((obj: any) => {
        // Check if object is a child of the specified group
        const parent = snapshot.objects.find((o: any) =>
          o.children?.some((c: any) => c.id === obj.id)
        )
        return parent?.id === inGroup
      })
    }

    return {
      content: [
        {
          type: 'text',
          text: `Found ${results.length} objects:\n\n${JSON.stringify(results, null, 2)}`,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error querying scene: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Handle get_scene_stats tool
 */
export async function handleGetSceneStats(sceneBridge: SceneBridge) {
  try {
    const snapshot = await sceneBridge.getSnapshot()
    const objects = snapshot.objects || []

    // Count objects by type
    const typeCounts: Record<string, number> = {}
    let totalObjects = 0
    let visibleObjects = 0
    let withInteractions = 0
    let withAnimations = 0
    let groups = 0

    objects.forEach((obj: any) => {
      totalObjects++
      typeCounts[obj.type] = (typeCounts[obj.type] || 0) + 1

      if (obj.visible !== false) visibleObjects++
      if (obj.interactions) withInteractions++
      if (obj.animations) withAnimations++
      if (obj.type === 'group') groups++
    })

    // Get material types used
    const materialTypes = new Set<string>()
    objects.forEach((obj: any) => {
      if (obj.material?.type) {
        materialTypes.add(obj.material.type)
      }
    })

    // Get geometry types used
    const geometryTypes = new Set<string>()
    objects.forEach((obj: any) => {
      if (obj.geometry?.type) {
        geometryTypes.add(obj.geometry.type)
      }
    })

    const stats = {
      scene: {
        id: snapshot.id,
        name: snapshot.name,
        version: snapshot.version,
      },
      objects: {
        total: totalObjects,
        visible: visibleObjects,
        hidden: totalObjects - visibleObjects,
        byType: typeCounts,
        withInteractions,
        withAnimations,
        groups,
      },
      materials: {
        types: Array.from(materialTypes),
        count: materialTypes.size,
      },
      geometry: {
        types: Array.from(geometryTypes),
        count: geometryTypes.size,
      },
      lighting: {
        ambient: snapshot.lighting?.ambient ? 'enabled' : 'disabled',
        directional: snapshot.lighting?.directional?.length || 0,
        point: snapshot.lighting?.point?.length || 0,
        spot: snapshot.lighting?.spot?.length || 0,
      },
    }

    return {
      content: [
        {
          type: 'text',
          text: `Scene Statistics:\n\n${JSON.stringify(stats, null, 2)}`,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error getting scene stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Handle update_scene_metadata tool
 */
export async function handleUpdateSceneMetadata(args: any, sceneBridge: SceneBridge) {
  try {
    const snapshot = await sceneBridge.getSnapshot()
    const { name, description, author, tags } = args

    // Update metadata
    const updates: any = {}
    if (name) updates.name = name
    if (description) updates['metadata.description'] = description
    if (author) updates['metadata.author'] = author
    if (tags) updates['metadata.tags'] = tags

    // Send update command
    await sceneBridge.send({
      command: 'update_scene_metadata',
      updates,
    })

    return {
      content: [
        {
          type: 'text',
          text: `Scene metadata updated:\n${JSON.stringify(updates, null, 2)}`,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error updating metadata: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Handle find_objects_near tool
 */
export async function handleFindObjectsNear(args: any, sceneBridge: SceneBridge) {
  try {
    const snapshot = await sceneBridge.getSnapshot()
    const { position, objectId, radius = 2.0 } = args

    let searchPos = position

    // If searching around an object, get its position
    if (objectId) {
      const obj = snapshot.objects.find((o: any) => o.id === objectId)
      if (!obj) {
        return {
          content: [{ type: 'text', text: `Object '${objectId}' not found` }],
          isError: true,
        }
      }
      searchPos = obj.transform.position
    }

    if (!searchPos) {
      return {
        content: [
          { type: 'text', text: 'Must provide either position or objectId' },
        ],
        isError: true,
      }
    }

    // Find objects within radius
    const nearby = snapshot.objects.filter((obj: any) => {
      if (objectId && obj.id === objectId) return false // Exclude the reference object

      const [x1, y1, z1] = searchPos
      const [x2, y2, z2] = obj.transform.position

      const distance = Math.sqrt(
        Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2)
      )

      return distance <= radius
    })

    // Calculate distances
    const results = nearby.map((obj: any) => {
      const [x1, y1, z1] = searchPos
      const [x2, y2, z2] = obj.transform.position
      const distance = Math.sqrt(
        Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2)
      )
      return { id: obj.id, name: obj.name, type: obj.type, distance: distance.toFixed(2) }
    })

    results.sort((a: any, b: any) => parseFloat(a.distance) - parseFloat(b.distance))

    return {
      content: [
        {
          type: 'text',
          text: `Found ${results.length} objects within radius ${radius}:\n\n${JSON.stringify(results, null, 2)}`,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error finding nearby objects: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Handle get_object_hierarchy tool
 */
export async function handleGetObjectHierarchy(args: any, sceneBridge: SceneBridge) {
  try {
    const snapshot = await sceneBridge.getSnapshot()
    const { objectId } = args

    const obj = snapshot.objects.find((o: any) => o.id === objectId)
    if (!obj) {
      return {
        content: [{ type: 'text', text: `Object '${objectId}' not found` }],
        isError: true,
      }
    }

    // Build hierarchy
    const hierarchy: any = {
      object: { id: obj.id, name: obj.name, type: obj.type },
      children: [],
      ancestors: [],
    }

    // Get children (if group)
    if (obj.children) {
      hierarchy.children = obj.children.map((child: any) => ({
        id: child.id,
        name: child.name,
        type: child.type,
      }))
    }

    // Find parent/ancestors
    const findParent = (searchId: string, objects: any[]): any => {
      for (const o of objects) {
        if (o.children?.some((c: any) => c.id === searchId)) {
          return o
        }
      }
      return null
    }

    let currentId = objectId
    while (true) {
      const parent = findParent(currentId, snapshot.objects)
      if (!parent) break

      hierarchy.ancestors.unshift({
        id: parent.id,
        name: parent.name,
        type: parent.type,
      })
      currentId = parent.id
    }

    return {
      content: [
        {
          type: 'text',
          text: `Object Hierarchy:\n\n${JSON.stringify(hierarchy, null, 2)}`,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error getting hierarchy: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Main scene query tool handler
 */
export async function handleSceneQueryTool(
  name: string,
  args: any,
  sceneBridge: SceneBridge
) {
  switch (name) {
    case 'query_scene':
      return await handleQueryScene(args, sceneBridge)
    case 'get_scene_stats':
      return await handleGetSceneStats(sceneBridge)
    case 'update_scene_metadata':
      return await handleUpdateSceneMetadata(args, sceneBridge)
    case 'find_objects_near':
      return await handleFindObjectsNear(args, sceneBridge)
    case 'get_object_hierarchy':
      return await handleGetObjectHierarchy(args, sceneBridge)
    default:
      return {
        content: [{ type: 'text', text: `Unknown scene query tool: ${name}` }],
        isError: true,
      }
  }
}
