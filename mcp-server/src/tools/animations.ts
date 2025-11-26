/**
 * MCP tools for animation control
 */

import { z } from 'zod'
import type { Tool } from '@modelcontextprotocol/sdk/types.js'
import type { SceneBridge } from '../bridge/websocket.js'

export const animationTools: Tool[] = [
  {
    name: 'get_registered_objects',
    description:
      'Get all registered static objects in the scene (GlassButtons, GlassCards, GlassPanels). These are the built-in UI elements that can be controlled via MCP.',
    inputSchema: {
      type: 'object',
      properties: {
        node: {
          type: 'string',
          description: 'Filter by parent node (home, consulting, software, construction, contact)',
        },
        type: {
          type: 'string',
          description: 'Filter by object type (GlassButton, GlassCard, GlassPanel)',
        },
      },
    },
  },
  {
    name: 'get_animation_state',
    description:
      'Get the current animation state of a registered object (hovered, pressed, loading, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'ID of the object to query',
        },
      },
      required: ['objectId'],
    },
  },
  {
    name: 'set_animation_state',
    description:
      'Set the animation state of a registered object (simulate hover, press, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'ID of the object to modify',
        },
        hovered: {
          type: 'boolean',
          description: 'Set hover state',
        },
        pressed: {
          type: 'boolean',
          description: 'Set pressed state',
        },
        loading: {
          type: 'boolean',
          description: 'Set loading state',
        },
        disabled: {
          type: 'boolean',
          description: 'Set disabled state',
        },
      },
      required: ['objectId'],
    },
  },
  {
    name: 'get_material_params',
    description:
      'Get the current material parameters of a registered object (transmission, roughness, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'ID of the object to query',
        },
      },
      required: ['objectId'],
    },
  },
  {
    name: 'set_material_params',
    description:
      'Set material parameters of a registered object for fine-grained control',
    inputSchema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'ID of the object to modify',
        },
        transmission: {
          type: 'number',
          description: 'Glass transmission (0-1, higher = more transparent)',
        },
        roughness: {
          type: 'number',
          description: 'Surface roughness (0-1, lower = shinier)',
        },
        ior: {
          type: 'number',
          description: 'Index of refraction (typically 1.45 for glass)',
        },
        emissiveIntensity: {
          type: 'number',
          description: 'Glow intensity (0-1)',
        },
        color: {
          type: 'string',
          description: 'Tint color (hex string like #4A90D9)',
        },
        envMapIntensity: {
          type: 'number',
          description: 'Environment reflection intensity',
        },
        clearcoat: {
          type: 'number',
          description: 'Clearcoat layer intensity (0-1)',
        },
      },
      required: ['objectId'],
    },
  },
  {
    name: 'trigger_animation',
    description:
      'Trigger a specific animation on a registered object',
    inputSchema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'ID of the object to animate',
        },
        animation: {
          type: 'string',
          description: 'Animation to trigger (pulse, ripple, glow, liquidDeform, fresnelShift, refractionWave, shake, etc.)',
        },
        params: {
          type: 'object',
          description: 'Optional animation parameters',
          properties: {
            intensity: { type: 'number' },
            duration: { type: 'number' },
            color: { type: 'string' },
            origin: {
              type: 'array',
              items: { type: 'number' },
              description: 'Origin point for ripple effect [x, y] in UV coordinates',
            },
          },
        },
      },
      required: ['objectId', 'animation'],
    },
  },
  {
    name: 'list_animations',
    description:
      'List available animations for an object or object type',
    inputSchema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'ID of a specific object',
        },
        type: {
          type: 'string',
          description: 'Object type (GlassButton, GlassCard, GlassPanel)',
        },
      },
    },
  },
]

// Zod validation schemas
const GetRegisteredObjectsSchema = z.object({
  node: z.string().optional(),
  type: z.string().optional(),
})

const GetAnimationStateSchema = z.object({
  objectId: z.string().min(1, 'objectId is required'),
})

const SetAnimationStateSchema = z.object({
  objectId: z.string().min(1, 'objectId is required'),
  hovered: z.boolean().optional(),
  pressed: z.boolean().optional(),
  loading: z.boolean().optional(),
  disabled: z.boolean().optional(),
})

const GetMaterialParamsSchema = z.object({
  objectId: z.string().min(1, 'objectId is required'),
})

const SetMaterialParamsSchema = z.object({
  objectId: z.string().min(1, 'objectId is required'),
  transmission: z.number().min(0).max(1).optional(),
  roughness: z.number().min(0).max(1).optional(),
  ior: z.number().min(1).max(3).optional(),
  emissiveIntensity: z.number().min(0).max(1).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'color must be a valid hex color').optional(),
  envMapIntensity: z.number().min(0).optional(),
  clearcoat: z.number().min(0).max(1).optional(),
})

const TriggerAnimationSchema = z.object({
  objectId: z.string().min(1, 'objectId is required'),
  animation: z.string().min(1, 'animation is required'),
  params: z.record(z.unknown()).optional(),
})

const ListAnimationsSchema = z.object({
  objectId: z.string().optional(),
  type: z.string().optional(),
})

export async function handleAnimationTool(
  toolName: string,
  args: Record<string, unknown> | undefined,
  bridge: SceneBridge
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  try {
    switch (toolName) {
      case 'get_registered_objects': {
        const params = GetRegisteredObjectsSchema.parse(args || {})
        const result = await bridge.getRegisteredObjects(params)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      }

      case 'get_animation_state': {
        const { objectId } = GetAnimationStateSchema.parse(args || {})
        const result = await bridge.getAnimationState(objectId)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      }

      case 'set_animation_state': {
        const { objectId, ...state } = SetAnimationStateSchema.parse(args || {})
        const result = await bridge.setAnimationState(objectId, state)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      }

      case 'get_material_params': {
        const { objectId } = GetMaterialParamsSchema.parse(args || {})
        const result = await bridge.getMaterialParams(objectId)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      }

      case 'set_material_params': {
        const { objectId, ...params } = SetMaterialParamsSchema.parse(args || {})
        const result = await bridge.setMaterialParams(objectId, params)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      }

      case 'trigger_animation': {
        const { objectId, animation, params } = TriggerAnimationSchema.parse(args || {})
        const result = await bridge.triggerAnimation(objectId, animation, params)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      }

      case 'list_animations': {
        const params = ListAnimationsSchema.parse(args || {})
        const result = await bridge.listAnimations(params.objectId, params.type)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      }

      default:
        return {
          content: [{ type: 'text', text: `Unknown animation tool: ${toolName}` }],
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
