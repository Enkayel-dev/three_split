/**
 * Scene inspection tools
 */

import { z } from 'zod'
import type { Tool } from '@modelcontextprotocol/sdk/types.js'
import type { SceneBridge } from '../bridge/websocket.js'

export const sceneTools: Tool[] = [
  {
    name: 'scene_snapshot',
    description:
      'Get a complete JSON snapshot of the current 3D scene, including camera position, current node, and all objects with their positions, rotations, and properties.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'list_objects',
    description:
      'List all dynamic objects in the scene. Can filter by node (home, consulting, software, construction, contact) or object type (GlassPanel, GlassCard, GlassButton, etc.).',
    inputSchema: {
      type: 'object',
      properties: {
        node: {
          type: 'string',
          description: 'Filter by scene node',
          enum: ['home', 'consulting', 'software', 'construction', 'contact'],
        },
        type: {
          type: 'string',
          description: 'Filter by object type',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_object',
    description:
      'Get detailed information about a specific object by its ID, including position, rotation, scale, material properties, and visibility.',
    inputSchema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'The unique ID of the object',
        },
      },
      required: ['objectId'],
    },
  },
]

// Zod validation schemas
const SceneSnapshotSchema = z.object({}).optional()

const ListObjectsSchema = z.object({
  node: z.enum(['home', 'consulting', 'software', 'construction', 'contact']).optional(),
  type: z.string().optional(),
})

const GetObjectSchema = z.object({
  objectId: z.string().min(1, 'objectId is required'),
})

export async function handleSceneTool(
  name: string,
  args: Record<string, unknown> | undefined,
  bridge: SceneBridge
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  try {
    switch (name) {
      case 'scene_snapshot': {
        // No parameters to validate
        const snapshot = await bridge.getSnapshot()
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(snapshot, null, 2),
            },
          ],
        }
      }

      case 'list_objects': {
        const filter = ListObjectsSchema.parse(args || {})
        const objects = await bridge.listObjects(filter)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(objects, null, 2),
            },
          ],
        }
      }

      case 'get_object': {
        const { objectId } = GetObjectSchema.parse(args || {})
        const object = await bridge.getObject(objectId)
        if (!object) {
          return {
            content: [{ type: 'text', text: `Object not found: ${objectId}` }],
            isError: true,
          }
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(object, null, 2),
            },
          ],
        }
      }

      default:
        return {
          content: [{ type: 'text', text: `Unknown scene tool: ${name}` }],
          isError: true,
        }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        content: [
          {
            type: 'text',
            text: `Validation error: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
          },
        ],
        isError: true,
      }
    }
    throw error
  }
}
