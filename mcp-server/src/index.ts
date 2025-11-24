#!/usr/bin/env node

/**
 * Three Split MCP Server
 *
 * Enables Claude Desktop to view and edit 3D scenes in the Liquid Glass website.
 *
 * Tools:
 * - scene_snapshot: Get current scene state
 * - create_object: Add new 3D objects
 * - edit_object: Modify existing objects
 * - delete_object: Remove objects
 * - list_objects: List scene objects
 * - get_object: Get object details
 * - navigate_to: Move camera
 * - set_material: Change object materials
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

import { SceneBridge } from './bridge/websocket.js'
import { sceneTools, handleSceneTool } from './tools/scene.js'
import { objectTools, handleObjectTool } from './tools/objects.js'
import { navigationTools, handleNavigationTool } from './tools/navigation.js'
import { materialTools, handleMaterialTool } from './tools/materials.js'
import { animationTools, handleAnimationTool } from './tools/animations.js'

// Initialize scene bridge for WebSocket connection to React app
const sceneBridge = new SceneBridge(process.env.SCENE_WS_URL || 'ws://localhost:3001')

// Create MCP server
const server = new Server(
  {
    name: 'three-split-scene',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
)

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      ...sceneTools,
      ...objectTools,
      ...navigationTools,
      ...materialTools,
      ...animationTools,
    ],
  }
})

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    // Scene tools
    if (['scene_snapshot', 'list_objects', 'get_object'].includes(name)) {
      return await handleSceneTool(name, args, sceneBridge)
    }

    // Object tools
    if (['create_object', 'edit_object', 'delete_object'].includes(name)) {
      return await handleObjectTool(name, args, sceneBridge)
    }

    // Navigation tools
    if (['navigate_to'].includes(name)) {
      return await handleNavigationTool(name, args, sceneBridge)
    }

    // Material tools
    if (['set_material'].includes(name)) {
      return await handleMaterialTool(name, args, sceneBridge)
    }

    // Animation tools
    if ([
      'get_registered_objects',
      'get_animation_state',
      'set_animation_state',
      'get_material_params',
      'set_material_params',
      'trigger_animation',
      'list_animations',
    ].includes(name)) {
      return await handleAnimationTool(name, args, sceneBridge)
    }

    return {
      content: [{ type: 'text', text: `Unknown tool: ${name}` }],
      isError: true,
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
})

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'scene://current',
        name: 'Current Scene State',
        description: 'JSON representation of the current 3D scene',
        mimeType: 'application/json',
      },
      {
        uri: 'scene://nodes',
        name: 'Scene Nodes',
        description: 'List of available navigation nodes',
        mimeType: 'application/json',
      },
    ],
  }
})

// Handle resource reads
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params

  if (uri === 'scene://current') {
    const snapshot = await sceneBridge.getSnapshot()
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(snapshot, null, 2),
        },
      ],
    }
  }

  if (uri === 'scene://nodes') {
    const nodes = ['home', 'consulting', 'software', 'construction', 'contact']
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({ nodes }, null, 2),
        },
      ],
    }
  }

  throw new Error(`Unknown resource: ${uri}`)
})

// Start server
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('Three Split MCP Server running')
}

main().catch(console.error)
