/**
 * Batch Operations Tools
 *
 * Tools for performing operations on multiple objects at once.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js'
import type { SceneBridge } from '../bridge/websocket.js'

/**
 * Batch operations tool definitions
 */
export const batchOperationsTools: Tool[] = [
  {
    name: 'batch_edit_objects',
    description:
      'Edit multiple objects at once. Apply the same updates to all specified objects.',
    inputSchema: {
      type: 'object',
      properties: {
        objectIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of object IDs to edit',
        },
        updates: {
          type: 'object',
          description: 'Updates to apply to all objects',
        },
      },
      required: ['objectIds', 'updates'],
    },
  },
  {
    name: 'batch_delete_objects',
    description: 'Delete multiple objects at once.',
    inputSchema: {
      type: 'object',
      properties: {
        objectIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of object IDs to delete',
        },
      },
      required: ['objectIds'],
    },
  },
  {
    name: 'batch_move_objects',
    description:
      'Move multiple objects together (maintaining relative positions) or separately.',
    inputSchema: {
      type: 'object',
      properties: {
        objectIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of object IDs to move',
        },
        offset: {
          type: 'array',
          items: { type: 'number' },
          description: 'Position offset [x, y, z] to apply to all objects',
        },
        maintainRelative: {
          type: 'boolean',
          description: 'Maintain relative positions between objects',
          default: true,
        },
      },
      required: ['objectIds', 'offset'],
    },
  },
  {
    name: 'batch_set_property',
    description:
      'Set a specific property to the same value for multiple objects.',
    inputSchema: {
      type: 'object',
      properties: {
        objectIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of object IDs',
        },
        property: {
          type: 'string',
          description: 'Property path (e.g., "visible", "material.color", "transform.scale")',
        },
        value: {
          description: 'Value to set (type depends on property)',
        },
      },
      required: ['objectIds', 'property', 'value'],
    },
  },
  {
    name: 'select_objects',
    description:
      'Select objects by query criteria, returning their IDs for use with other batch operations.',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: 'Filter by object type',
        },
        visible: {
          type: 'boolean',
          description: 'Filter by visibility',
        },
        namePattern: {
          type: 'string',
          description: 'Filter by name pattern (supports wildcards)',
        },
        hasTag: {
          type: 'string',
          description: 'Filter by metadata tag',
        },
      },
    },
  },
  {
    name: 'batch_transform',
    description:
      'Apply transformations to multiple objects (rotate, scale, translate).',
    inputSchema: {
      type: 'object',
      properties: {
        objectIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of object IDs',
        },
        operation: {
          type: 'string',
          enum: ['translate', 'rotate', 'scale'],
          description: 'Transformation operation',
        },
        value: {
          type: 'array',
          items: { type: 'number' },
          description: 'Transformation values [x, y, z]',
        },
        relative: {
          type: 'boolean',
          description: 'Apply as relative transformation',
          default: true,
        },
      },
      required: ['objectIds', 'operation', 'value'],
    },
  },
]

/**
 * Handle batch_edit_objects tool
 */
export async function handleBatchEditObjects(args: any, sceneBridge: SceneBridge) {
  try {
    const { objectIds, updates } = args
    const results: any[] = []

    for (const objectId of objectIds) {
      try {
        await sceneBridge.send({
          command: 'edit_object',
          objectId,
          updates,
        })
        results.push({ objectId, success: true })
      } catch (error) {
        results.push({
          objectId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    const successCount = results.filter((r) => r.success).length
    const failCount = results.length - successCount

    return {
      content: [
        {
          type: 'text',
          text: `Batch edit completed:\n✓ ${successCount} successful\n✗ ${failCount} failed\n\nUpdates applied:\n${JSON.stringify(updates, null, 2)}`,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error in batch edit: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Handle batch_delete_objects tool
 */
export async function handleBatchDeleteObjects(args: any, sceneBridge: SceneBridge) {
  try {
    const { objectIds } = args
    const results: any[] = []

    for (const objectId of objectIds) {
      try {
        await sceneBridge.send({
          command: 'delete_object',
          objectId,
        })
        results.push({ objectId, success: true })
      } catch (error) {
        results.push({
          objectId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    const successCount = results.filter((r) => r.success).length
    const failCount = results.length - successCount

    return {
      content: [
        {
          type: 'text',
          text: `Batch delete completed:\n✓ ${successCount} deleted\n✗ ${failCount} failed`,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error in batch delete: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Handle batch_move_objects tool
 */
export async function handleBatchMoveObjects(args: any, sceneBridge: SceneBridge) {
  try {
    const snapshot = await sceneBridge.getSnapshot()
    const { objectIds, offset, maintainRelative = true } = args

    if (!maintainRelative) {
      // Simple case: apply same offset to all
      const results: any[] = []

      for (const objectId of objectIds) {
        const obj = snapshot.objects?.find((o: any) => o.id === objectId)
        if (!obj) continue

        try {
          await sceneBridge.send({
            command: 'edit_object',
            objectId,
            updates: {
              position: [
                obj.transform.position[0] + offset[0],
                obj.transform.position[1] + offset[1],
                obj.transform.position[2] + offset[2],
              ],
            },
          })
          results.push({ objectId, success: true })
        } catch (error) {
          results.push({
            objectId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }

      const successCount = results.filter((r) => r.success).length

      return {
        content: [
          {
            type: 'text',
            text: `Batch move completed:\n✓ ${successCount} objects moved by offset [${offset.join(', ')}]`,
          },
        ],
      }
    } else {
      // Maintain relative positions: move as a group
      const objects = objectIds
        .map((id: string) => snapshot.objects?.find((o: any) => o.id === id))
        .filter(Boolean)

      if (objects.length === 0) {
        return {
          content: [{ type: 'text', text: 'No valid objects found' }],
          isError: true,
        }
      }

      // Apply offset to all
      for (const obj of objects) {
        await sceneBridge.send({
          command: 'edit_object',
          objectId: obj.id,
          updates: {
            position: [
              obj.transform.position[0] + offset[0],
              obj.transform.position[1] + offset[1],
              obj.transform.position[2] + offset[2],
            ],
          },
        })
      }

      return {
        content: [
          {
            type: 'text',
            text: `Moved ${objects.length} objects together by offset [${offset.join(', ')}]`,
          },
        ],
      }
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error in batch move: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Handle batch_set_property tool
 */
export async function handleBatchSetProperty(args: any, sceneBridge: SceneBridge) {
  try {
    const { objectIds, property, value } = args
    const results: any[] = []

    for (const objectId of objectIds) {
      try {
        // Build updates object from property path
        const updates: any = {}
        const parts = property.split('.')

        if (parts.length === 1) {
          updates[property] = value
        } else {
          // Nested property (e.g., "material.color")
          let current = updates
          for (let i = 0; i < parts.length - 1; i++) {
            current[parts[i]] = current[parts[i]] || {}
            current = current[parts[i]]
          }
          current[parts[parts.length - 1]] = value
        }

        await sceneBridge.send({
          command: 'edit_object',
          objectId,
          updates,
        })
        results.push({ objectId, success: true })
      } catch (error) {
        results.push({
          objectId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    const successCount = results.filter((r) => r.success).length
    const failCount = results.length - successCount

    return {
      content: [
        {
          type: 'text',
          text: `Batch set property completed:\n✓ ${successCount} successful\n✗ ${failCount} failed\n\nProperty: ${property}\nValue: ${JSON.stringify(value)}`,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error in batch set property: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Handle select_objects tool
 */
export async function handleSelectObjects(args: any, sceneBridge: SceneBridge) {
  try {
    const snapshot = await sceneBridge.getSnapshot()
    const { type, visible, namePattern, hasTag } = args

    let results = snapshot.objects || []

    if (type) {
      results = results.filter((obj: any) => obj.type === type)
    }

    if (visible !== undefined) {
      results = results.filter((obj: any) => obj.visible === visible)
    }

    if (namePattern) {
      const regex = new RegExp(
        '^' + namePattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$',
        'i'
      )
      results = results.filter((obj: any) => obj.name && regex.test(obj.name))
    }

    if (hasTag) {
      results = results.filter(
        (obj: any) => obj.metadata?.tags?.includes(hasTag)
      )
    }

    const objectIds = results.map((obj: any) => obj.id)

    return {
      content: [
        {
          type: 'text',
          text: `Selected ${objectIds.length} objects:\n${objectIds.join('\n')}`,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error selecting objects: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Handle batch_transform tool
 */
export async function handleBatchTransform(args: any, sceneBridge: SceneBridge) {
  try {
    const snapshot = await sceneBridge.getSnapshot()
    const { objectIds, operation, value, relative = true } = args
    const results: any[] = []

    for (const objectId of objectIds) {
      const obj = snapshot.objects?.find((o: any) => o.id === objectId)
      if (!obj) continue

      try {
        const updates: any = {}

        switch (operation) {
          case 'translate':
            updates.position = relative
              ? [
                  obj.transform.position[0] + value[0],
                  obj.transform.position[1] + value[1],
                  obj.transform.position[2] + value[2],
                ]
              : value
            break
          case 'rotate':
            updates.rotation = relative
              ? [
                  obj.transform.rotation[0] + value[0],
                  obj.transform.rotation[1] + value[1],
                  obj.transform.rotation[2] + value[2],
                ]
              : value
            break
          case 'scale':
            updates.scale = relative
              ? [
                  obj.transform.scale[0] * value[0],
                  obj.transform.scale[1] * value[1],
                  obj.transform.scale[2] * value[2],
                ]
              : value
            break
        }

        await sceneBridge.send({
          command: 'edit_object',
          objectId,
          updates,
        })
        results.push({ objectId, success: true })
      } catch (error) {
        results.push({
          objectId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    const successCount = results.filter((r) => r.success).length
    const failCount = results.length - successCount

    return {
      content: [
        {
          type: 'text',
          text: `Batch ${operation} completed:\n✓ ${successCount} successful\n✗ ${failCount} failed`,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error in batch transform: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Main batch operations tool handler
 */
export async function handleBatchOperationsTool(
  name: string,
  args: any,
  sceneBridge: SceneBridge
) {
  switch (name) {
    case 'batch_edit_objects':
      return await handleBatchEditObjects(args, sceneBridge)
    case 'batch_delete_objects':
      return await handleBatchDeleteObjects(args, sceneBridge)
    case 'batch_move_objects':
      return await handleBatchMoveObjects(args, sceneBridge)
    case 'batch_set_property':
      return await handleBatchSetProperty(args, sceneBridge)
    case 'select_objects':
      return await handleSelectObjects(args, sceneBridge)
    case 'batch_transform':
      return await handleBatchTransform(args, sceneBridge)
    default:
      return {
        content: [{ type: 'text', text: `Unknown batch operations tool: ${name}` }],
        isError: true,
      }
  }
}
