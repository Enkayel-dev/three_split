/**
 * Object manipulation tools
 */

import { z } from 'zod'
import type { Tool } from '@modelcontextprotocol/sdk/types.js'
import type { SceneBridge } from '../bridge/websocket.js'

export const objectTools: Tool[] = [
  {
    name: 'create_object',
    description:
      'Create a new 3D object in the scene. Supports glass components (GlassPanel, GlassCard, GlassButton) and primitives (Box, Sphere, Cylinder, Text3D).',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: 'Object type to create',
          enum: [
            'GlassPanel',
            'GlassCard',
            'GlassButton',
            'Box',
            'Sphere',
            'Cylinder',
            'Text3D',
          ],
        },
        position: {
          type: 'array',
          items: { type: 'number' },
          minItems: 3,
          maxItems: 3,
          description: 'World position [x, y, z]',
        },
        rotation: {
          type: 'array',
          items: { type: 'number' },
          minItems: 3,
          maxItems: 3,
          description: 'Euler rotation in radians [x, y, z]',
        },
        scale: {
          type: 'array',
          items: { type: 'number' },
          minItems: 3,
          maxItems: 3,
          description: 'Scale factor [x, y, z]',
        },
        properties: {
          type: 'object',
          description:
            'Type-specific properties. For GlassCard: title, subtitle, width, height. For GlassButton: label, variant. For primitives: size/radius.',
        },
        parentNode: {
          type: 'string',
          description: 'Which scene node to attach to',
          enum: ['home', 'consulting', 'software', 'construction', 'contact'],
        },
      },
      required: ['type', 'position'],
    },
  },
  {
    name: 'edit_object',
    description:
      "Modify an existing object's transform (position, rotation, scale), properties, or visibility.",
    inputSchema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'ID of the object to edit',
        },
        position: {
          type: 'array',
          items: { type: 'number' },
          minItems: 3,
          maxItems: 3,
          description: 'New world position [x, y, z]',
        },
        rotation: {
          type: 'array',
          items: { type: 'number' },
          minItems: 3,
          maxItems: 3,
          description: 'New rotation in radians [x, y, z]',
        },
        scale: {
          type: 'array',
          items: { type: 'number' },
          minItems: 3,
          maxItems: 3,
          description: 'New scale [x, y, z]',
        },
        properties: {
          type: 'object',
          description: 'Properties to update',
        },
        visible: {
          type: 'boolean',
          description: 'Show or hide the object',
        },
      },
      required: ['objectId'],
    },
  },
  {
    name: 'delete_object',
    description: 'Remove an object from the scene permanently.',
    inputSchema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'ID of the object to delete',
        },
      },
      required: ['objectId'],
    },
  },
]

// Zod validation schemas
const Vector3Schema = z.tuple([z.number(), z.number(), z.number()])

const CreateObjectSchema = z.object({
  type: z.enum(['GlassPanel', 'GlassCard', 'GlassButton', 'Box', 'Sphere', 'Cylinder', 'Text3D']),
  position: Vector3Schema,
  rotation: Vector3Schema.optional(),
  scale: Vector3Schema.optional(),
  properties: z.record(z.unknown()).optional(),
  parentNode: z.enum(['home', 'consulting', 'software', 'construction', 'contact']).optional(),
})

const EditObjectSchema = z.object({
  objectId: z.string().min(1, 'objectId is required'),
  position: Vector3Schema.optional(),
  rotation: Vector3Schema.optional(),
  scale: Vector3Schema.optional(),
  properties: z.record(z.unknown()).optional(),
  visible: z.boolean().optional(),
})

const DeleteObjectSchema = z.object({
  objectId: z.string().min(1, 'objectId is required'),
})

export async function handleObjectTool(
  name: string,
  args: Record<string, unknown> | undefined,
  bridge: SceneBridge
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  try {
    switch (name) {
      case 'create_object': {
        const params = CreateObjectSchema.parse(args || {})
        const result = await bridge.createObject(params)
        return {
          content: [
            {
              type: 'text',
              text: result.success
                ? `Created ${params.type} with ID: ${result.objectId}\n${result.message}`
                : `Failed to create object: ${result.message}`,
            },
          ],
          isError: !result.success,
        }
      }

      case 'edit_object': {
        const params = EditObjectSchema.parse(args || {})
        const result = await bridge.editObject(params)
        return {
          content: [
            {
              type: 'text',
              text: result.success
                ? `Updated object ${params.objectId}: ${result.message}`
                : `Failed to update object: ${result.message}`,
            },
          ],
          isError: !result.success,
        }
      }

      case 'delete_object': {
        const { objectId } = DeleteObjectSchema.parse(args || {})
        const result = await bridge.deleteObject(objectId)
        return {
          content: [
            {
              type: 'text',
              text: result.success
                ? `Deleted object: ${objectId}`
                : `Failed to delete object: ${result.message}`,
            },
          ],
          isError: !result.success,
        }
      }

      default:
        return {
          content: [{ type: 'text', text: `Unknown object tool: ${name}` }],
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
