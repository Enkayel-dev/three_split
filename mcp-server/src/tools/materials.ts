/**
 * Material editing tools
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js'
import type { SceneBridge } from '../bridge/websocket.js'

export const materialTools: Tool[] = [
  {
    name: 'set_material',
    description:
      "Change an object's glass material properties. Use presets for quick changes or fine-tune individual properties.",
    inputSchema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'ID of the object to modify',
        },
        preset: {
          type: 'string',
          description: 'Material preset',
          enum: ['standard', 'frosted', 'clear', 'tinted', 'highContrast'],
        },
        transmission: {
          type: 'number',
          description: 'Glass transparency (0-1, higher = more transparent)',
          minimum: 0,
          maximum: 1,
        },
        roughness: {
          type: 'number',
          description: 'Surface roughness/blur (0-1, higher = more frosted)',
          minimum: 0,
          maximum: 1,
        },
        color: {
          type: 'string',
          description: 'Tint color as hex string (e.g., "#4A90D9")',
        },
      },
      required: ['objectId'],
    },
  },
]

export async function handleMaterialTool(
  name: string,
  args: Record<string, unknown> | undefined,
  bridge: SceneBridge
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  switch (name) {
    case 'set_material': {
      const params = args as {
        objectId: string
        preset?: string
        transmission?: number
        roughness?: number
        color?: string
      }

      const result = await bridge.setMaterial(params)
      return {
        content: [
          {
            type: 'text',
            text: result.success
              ? `Updated material for ${params.objectId}: ${result.message}`
              : `Failed to update material: ${result.message}`,
          },
        ],
        isError: !result.success,
      }
    }

    default:
      return {
        content: [{ type: 'text', text: `Unknown material tool: ${name}` }],
        isError: true,
      }
  }
}
