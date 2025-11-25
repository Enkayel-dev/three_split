#!/usr/bin/env node

/**
 * Three Split MCP Server
 *
 * Enables Claude Desktop to view and edit 3D scenes in the Liquid Glass website.
 *
 * Scene Tools:
 * - scene_snapshot: Get current scene state
 * - list_objects: List scene objects
 * - get_object: Get object details
 *
 * Object Tools:
 * - create_object: Add new 3D objects
 * - edit_object: Modify existing objects
 * - delete_object: Remove objects
 *
 * Navigation Tools:
 * - navigate_to: Move camera
 *
 * Material Tools:
 * - set_material: Change object materials
 *
 * Animation Tools:
 * - get_registered_objects, get_animation_state, set_animation_state
 * - get_material_params, set_material_params, trigger_animation, list_animations
 *
 * Persistence Tools (Phase 3):
 * - save_scene: Save scene to JSON file with backup
 * - load_scene: Load scene from JSON file
 * - export_scene: Export scene as JSON string
 * - list_scene_backups: List available backups
 * - restore_scene_backup: Restore from backup
 *
 * Scene Query Tools (Phase 4):
 * - query_scene: Advanced scene querying with filters
 * - get_scene_stats: Get scene statistics
 * - update_scene_metadata: Update scene metadata
 * - find_objects_near: Find objects near a position
 * - get_object_hierarchy: Get object parent/child tree
 *
 * Object Manipulation Tools (Phase 4):
 * - clone_object: Clone an object with offset
 * - move_object: Move object (position/rotation/scale)
 * - show_object: Make object visible
 * - hide_object: Make object invisible
 * - rename_object: Change object name
 * - duplicate_object: Duplicate in patterns (line/grid/circle)
 *
 * Batch Operations Tools (Phase 4):
 * - batch_edit_objects: Edit multiple objects at once
 * - batch_delete_objects: Delete multiple objects
 * - batch_move_objects: Move multiple objects together
 * - batch_set_property: Set property for multiple objects
 * - select_objects: Select objects by criteria
 * - batch_transform: Transform multiple objects
 *
 * Scene Organization Tools (Phase 4):
 * - create_group: Create new group
 * - add_to_group: Add objects to group
 * - remove_from_group: Remove objects from group
 * - list_groups: List all groups
 * - ungroup: Dissolve a group
 * - get_group_bounds: Get group bounding box
 *
 * Validation Tools (Phase 4):
 * - validate_scene: Validate entire scene
 * - check_scene_health: Check for common issues
 * - validate_object: Validate single object
 * - fix_common_issues: Auto-fix common problems
 * - check_performance: Analyze performance
 * - validate_references: Check object references
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
import { persistenceTools, handlePersistenceTool } from './tools/persistence.js'
import { sceneQueryTools, handleSceneQueryTool } from './tools/sceneQuery.js'
import { objectManipulationTools, handleObjectManipulationTool } from './tools/objectManipulation.js'
import { batchOperationsTools, handleBatchOperationsTool } from './tools/batchOperations.js'
import { sceneOrganizationTools, handleSceneOrganizationTool } from './tools/sceneOrganization.js'
import { validationTools, handleValidationTool } from './tools/validation.js'

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
      ...persistenceTools,
      ...sceneQueryTools,
      ...objectManipulationTools,
      ...batchOperationsTools,
      ...sceneOrganizationTools,
      ...validationTools,
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

    // Persistence tools
    if ([
      'save_scene',
      'load_scene',
      'export_scene',
      'list_scene_backups',
      'restore_scene_backup',
    ].includes(name)) {
      return await handlePersistenceTool(name, args, sceneBridge)
    }

    // Scene query tools
    if ([
      'query_scene',
      'get_scene_stats',
      'update_scene_metadata',
      'find_objects_near',
      'get_object_hierarchy',
    ].includes(name)) {
      return await handleSceneQueryTool(name, args, sceneBridge)
    }

    // Object manipulation tools
    if ([
      'clone_object',
      'move_object',
      'show_object',
      'hide_object',
      'rename_object',
      'duplicate_object',
    ].includes(name)) {
      return await handleObjectManipulationTool(name, args, sceneBridge)
    }

    // Batch operations tools
    if ([
      'batch_edit_objects',
      'batch_delete_objects',
      'batch_move_objects',
      'batch_set_property',
      'select_objects',
      'batch_transform',
    ].includes(name)) {
      return await handleBatchOperationsTool(name, args, sceneBridge)
    }

    // Scene organization tools
    if ([
      'create_group',
      'add_to_group',
      'remove_from_group',
      'list_groups',
      'ungroup',
      'get_group_bounds',
    ].includes(name)) {
      return await handleSceneOrganizationTool(name, args, sceneBridge)
    }

    // Validation tools
    if ([
      'validate_scene',
      'check_scene_health',
      'validate_object',
      'fix_common_issues',
      'check_performance',
      'validate_references',
    ].includes(name)) {
      return await handleValidationTool(name, args, sceneBridge)
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
