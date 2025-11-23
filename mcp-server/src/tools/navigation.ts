/**
 * Camera navigation tools
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js'
import type { SceneBridge } from '../bridge/websocket.js'

export const navigationTools: Tool[] = [
  {
    name: 'navigate_to',
    description:
      'Move the camera to a specific scene node or custom position. Use this to change which part of the 3D scene is visible.',
    inputSchema: {
      type: 'object',
      properties: {
        node: {
          type: 'string',
          description: 'Scene node to navigate to',
          enum: ['home', 'consulting', 'software', 'construction', 'contact'],
        },
        position: {
          type: 'array',
          items: { type: 'number' },
          minItems: 3,
          maxItems: 3,
          description: 'Custom camera position [x, y, z] (overrides node position)',
        },
        lookAt: {
          type: 'array',
          items: { type: 'number' },
          minItems: 3,
          maxItems: 3,
          description: 'Point for camera to look at [x, y, z]',
        },
      },
      required: [],
    },
  },
]

export async function handleNavigationTool(
  name: string,
  args: Record<string, unknown> | undefined,
  bridge: SceneBridge
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  switch (name) {
    case 'navigate_to': {
      const params = args as {
        node?: string
        position?: [number, number, number]
        lookAt?: [number, number, number]
      }

      if (!params.node && !params.position) {
        return {
          content: [
            {
              type: 'text',
              text: 'Must specify either a node or custom position',
            },
          ],
          isError: true,
        }
      }

      const result = await bridge.navigateTo(params)
      return {
        content: [
          {
            type: 'text',
            text: result.success
              ? `Navigating to ${params.node || 'custom position'}: ${result.message}`
              : `Navigation failed: ${result.message}`,
          },
        ],
        isError: !result.success,
      }
    }

    default:
      return {
        content: [{ type: 'text', text: `Unknown navigation tool: ${name}` }],
        isError: true,
      }
  }
}
