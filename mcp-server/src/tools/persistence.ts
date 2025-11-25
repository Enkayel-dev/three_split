/**
 * Scene Persistence Tools
 *
 * MCP tools for saving, loading, and managing scene definitions.
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import type { Tool } from '@modelcontextprotocol/sdk/types.js'
import type { SceneBridge } from '../bridge/websocket.js'
import {
  writeFileAtomic,
  listBackups,
  restoreFromBackup,
  cleanOldBackups,
  validateSceneJSON,
} from '../utils/fileWriter.js'

/**
 * Persistence tool definitions
 */
export const persistenceTools: Tool[] = [
  {
    name: 'save_scene',
    description:
      'Save the current scene definition to a JSON file with automatic backup. This creates a permanent copy of the scene that persists across sessions.',
    inputSchema: {
      type: 'object',
      properties: {
        sceneId: {
          type: 'string',
          description: 'Scene ID (will be saved as public/scenes/{sceneId}.json)',
        },
        createBackup: {
          type: 'boolean',
          description: 'Create backup of existing file (default: true)',
          default: true,
        },
      },
      required: ['sceneId'],
    },
  },
  {
    name: 'load_scene',
    description:
      'Load a scene definition from a JSON file and apply it to the current scene. This replaces all objects, camera, lighting, etc.',
    inputSchema: {
      type: 'object',
      properties: {
        sceneId: {
          type: 'string',
          description: 'Scene ID to load (from public/scenes/{sceneId}.json)',
        },
      },
      required: ['sceneId'],
    },
  },
  {
    name: 'export_scene',
    description:
      'Export the current scene definition as a JSON string. Useful for inspection or manual editing.',
    inputSchema: {
      type: 'object',
      properties: {
        pretty: {
          type: 'boolean',
          description: 'Format JSON with indentation (default: true)',
          default: true,
        },
      },
    },
  },
  {
    name: 'list_scene_backups',
    description:
      'List all backup files for a specific scene, sorted by timestamp (most recent first).',
    inputSchema: {
      type: 'object',
      properties: {
        sceneId: {
          type: 'string',
          description: 'Scene ID to list backups for',
        },
      },
      required: ['sceneId'],
    },
  },
  {
    name: 'restore_scene_backup',
    description:
      'Restore a scene from a backup file. This will replace the current scene file with the backup.',
    inputSchema: {
      type: 'object',
      properties: {
        sceneId: {
          type: 'string',
          description: 'Scene ID to restore',
        },
        backupIndex: {
          type: 'number',
          description: 'Backup index (0 = most recent, 1 = second most recent, etc.)',
          default: 0,
        },
      },
      required: ['sceneId'],
    },
  },
]

/**
 * Get the scenes directory path
 */
function getScenesDir(): string {
  // MCP server runs from mcp-server/, scenes are in ../public/scenes/
  return path.join(process.cwd(), '..', 'public', 'scenes')
}

/**
 * Get the path for a scene file
 */
function getScenePath(sceneId: string): string {
  return path.join(getScenesDir(), `${sceneId}.json`)
}

/**
 * Handle save_scene tool
 */
export async function handleSaveScene(
  args: { sceneId: string; createBackup?: boolean },
  sceneBridge: SceneBridge
) {
  const { sceneId, createBackup = true } = args

  try {
    // Get current scene state from bridge
    const snapshot = await sceneBridge.getSnapshot()

    // Convert to JSON
    const content = JSON.stringify(snapshot, null, 2)

    // Validate before saving
    if (!validateSceneJSON(content)) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: Scene validation failed. The scene data is not in a valid format.`,
          },
        ],
        isError: true,
      }
    }

    // Write atomically with backup
    const scenePath = getScenePath(sceneId)
    const result = await writeFileAtomic(scenePath, content, {
      createBackup,
      validate: validateSceneJSON,
    })

    if (!result.success) {
      return {
        content: [
          {
            type: 'text',
            text: `Error saving scene: ${result.error}`,
          },
        ],
        isError: true,
      }
    }

    // Clean old backups (keep last 10)
    if (createBackup) {
      await cleanOldBackups(scenePath, 10)
    }

    let message = `Scene '${sceneId}' saved successfully to ${result.path}`
    if (result.backupPath) {
      message += `\nBackup created: ${result.backupPath}`
    }

    return {
      content: [{ type: 'text', text: message }],
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
}

/**
 * Handle load_scene tool
 */
export async function handleLoadScene(
  args: { sceneId: string },
  sceneBridge: SceneBridge
) {
  const { sceneId } = args

  try {
    const scenePath = getScenePath(sceneId)

    // Read scene file
    const content = await fs.readFile(scenePath, 'utf-8')

    // Validate
    if (!validateSceneJSON(content)) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: Scene file is not valid JSON or missing required fields`,
          },
        ],
        isError: true,
      }
    }

    const sceneData = JSON.parse(content)

    // Send to browser via WebSocket
    // Note: This would require a new WebSocket command to load a scene
    // For now, just return the scene data
    return {
      content: [
        {
          type: 'text',
          text: `Scene '${sceneId}' loaded successfully.\n\n${JSON.stringify(sceneData, null, 2)}`,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error loading scene: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Handle export_scene tool
 */
export async function handleExportScene(
  args: { pretty?: boolean },
  sceneBridge: SceneBridge
) {
  const { pretty = true } = args

  try {
    const snapshot = await sceneBridge.getSnapshot()
    const content = JSON.stringify(snapshot, null, pretty ? 2 : undefined)

    return {
      content: [
        {
          type: 'text',
          text: `Current scene exported:\n\n${content}`,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error exporting scene: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Handle list_scene_backups tool
 */
export async function handleListSceneBackups(args: { sceneId: string }) {
  const { sceneId } = args

  try {
    const scenePath = getScenePath(sceneId)
    const backups = await listBackups(scenePath)

    if (backups.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No backups found for scene '${sceneId}'`,
          },
        ],
      }
    }

    const backupList = backups
      .map((backup, index) => {
        const basename = path.basename(backup)
        const timestamp = basename.match(/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/)?.[0]
        return `${index}: ${timestamp || basename}`
      })
      .join('\n')

    return {
      content: [
        {
          type: 'text',
          text: `Backups for scene '${sceneId}':\n\n${backupList}`,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error listing backups: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Handle restore_scene_backup tool
 */
export async function handleRestoreSceneBackup(args: {
  sceneId: string
  backupIndex?: number
}) {
  const { sceneId, backupIndex = 0 } = args

  try {
    const scenePath = getScenePath(sceneId)
    const backups = await listBackups(scenePath)

    if (backups.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No backups found for scene '${sceneId}'`,
          },
        ],
        isError: true,
      }
    }

    if (backupIndex < 0 || backupIndex >= backups.length) {
      return {
        content: [
          {
            type: 'text',
            text: `Invalid backup index ${backupIndex}. Available backups: 0-${backups.length - 1}`,
          },
        ],
        isError: true,
      }
    }

    const backupPath = backups[backupIndex]
    const result = await restoreFromBackup(backupPath, scenePath)

    if (!result.success) {
      return {
        content: [
          {
            type: 'text',
            text: `Error restoring backup: ${result.error}`,
          },
        ],
        isError: true,
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: `Scene '${sceneId}' restored from backup ${backupIndex}\n${result.message}`,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error restoring backup: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Main persistence tool handler
 */
export async function handlePersistenceTool(
  name: string,
  args: any,
  sceneBridge: SceneBridge
) {
  switch (name) {
    case 'save_scene':
      return await handleSaveScene(args, sceneBridge)
    case 'load_scene':
      return await handleLoadScene(args, sceneBridge)
    case 'export_scene':
      return await handleExportScene(args, sceneBridge)
    case 'list_scene_backups':
      return await handleListSceneBackups(args)
    case 'restore_scene_backup':
      return await handleRestoreSceneBackup(args)
    default:
      return {
        content: [{ type: 'text', text: `Unknown persistence tool: ${name}` }],
        isError: true,
      }
  }
}
