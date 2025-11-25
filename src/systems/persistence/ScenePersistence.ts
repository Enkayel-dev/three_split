/**
 * Scene Persistence Utilities
 *
 * Client-side utilities for scene persistence operations.
 * These work in conjunction with MCP server persistence tools.
 */

import type { SceneDefinition } from '@/types/sceneDefinition'

/**
 * Result of a persistence operation
 */
export interface PersistenceResult {
  success: boolean
  message?: string
  error?: string
  path?: string
  backupPath?: string
}

/**
 * Save scene definition to local storage (browser-side cache)
 *
 * This provides temporary persistence for development and testing.
 * For permanent persistence, use the MCP save_scene tool.
 */
export function saveSceneToLocalStorage(sceneId: string, definition: SceneDefinition): void {
  try {
    const key = `scene_${sceneId}`
    const data = JSON.stringify(definition)
    localStorage.setItem(key, data)
    console.log(`Scene ${sceneId} saved to localStorage`)
  } catch (error) {
    console.error(`Failed to save scene ${sceneId} to localStorage:`, error)
  }
}

/**
 * Load scene definition from local storage
 */
export function loadSceneFromLocalStorage(sceneId: string): SceneDefinition | null {
  try {
    const key = `scene_${sceneId}`
    const data = localStorage.getItem(key)

    if (!data) {
      return null
    }

    return JSON.parse(data) as SceneDefinition
  } catch (error) {
    console.error(`Failed to load scene ${sceneId} from localStorage:`, error)
    return null
  }
}

/**
 * Clear scene from local storage
 */
export function clearSceneFromLocalStorage(sceneId: string): void {
  try {
    const key = `scene_${sceneId}`
    localStorage.removeItem(key)
    console.log(`Scene ${sceneId} cleared from localStorage`)
  } catch (error) {
    console.error(`Failed to clear scene ${sceneId} from localStorage:`, error)
  }
}

/**
 * List all scenes in local storage
 */
export function listScenesInLocalStorage(): string[] {
  try {
    const keys: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('scene_')) {
        keys.push(key.replace('scene_', ''))
      }
    }

    return keys
  } catch (error) {
    console.error('Failed to list scenes in localStorage:', error)
    return []
  }
}

/**
 * Export scene as JSON string
 */
export function exportSceneAsJSON(definition: SceneDefinition, pretty: boolean = true): string {
  return JSON.stringify(definition, null, pretty ? 2 : undefined)
}

/**
 * Parse scene from JSON string
 */
export function parseSceneFromJSON(json: string): SceneDefinition | null {
  try {
    return JSON.parse(json) as SceneDefinition
  } catch (error) {
    console.error('Failed to parse scene JSON:', error)
    return null
  }
}

/**
 * Download scene as JSON file
 */
export function downloadSceneAsFile(definition: SceneDefinition, filename?: string): void {
  const json = exportSceneAsJSON(definition, true)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename || `${definition.id}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  console.log(`Scene ${definition.id} downloaded as ${a.download}`)
}

/**
 * Create a scene diff (changes between two versions)
 */
export interface SceneDiff {
  id: string
  changes: {
    metadata?: Partial<SceneDefinition['metadata']>
    camera?: Partial<SceneDefinition['camera']>
    background?: Partial<SceneDefinition['background']>
    lighting?: Partial<SceneDefinition['lighting']>
    objectsAdded?: string[]
    objectsRemoved?: string[]
    objectsModified?: Array<{
      id: string
      changes: Record<string, unknown>
    }>
  }
}

/**
 * Compare two scene definitions and create a diff
 */
export function createSceneDiff(
  before: SceneDefinition,
  after: SceneDefinition
): SceneDiff {
  const diff: SceneDiff = {
    id: after.id,
    changes: {},
  }

  // Compare metadata
  if (JSON.stringify(before.metadata) !== JSON.stringify(after.metadata)) {
    diff.changes.metadata = after.metadata
  }

  // Compare camera
  if (JSON.stringify(before.camera) !== JSON.stringify(after.camera)) {
    diff.changes.camera = after.camera
  }

  // Compare background
  if (JSON.stringify(before.background) !== JSON.stringify(after.background)) {
    diff.changes.background = after.background
  }

  // Compare lighting
  if (JSON.stringify(before.lighting) !== JSON.stringify(after.lighting)) {
    diff.changes.lighting = after.lighting
  }

  // Compare objects
  const beforeIds = new Set(before.objects.map((o) => o.id))
  const afterIds = new Set(after.objects.map((o) => o.id))

  diff.changes.objectsAdded = after.objects
    .filter((o) => !beforeIds.has(o.id))
    .map((o) => o.id)

  diff.changes.objectsRemoved = before.objects
    .filter((o) => !afterIds.has(o.id))
    .map((o) => o.id)

  diff.changes.objectsModified = after.objects
    .filter((afterObj) => {
      const beforeObj = before.objects.find((o) => o.id === afterObj.id)
      return beforeObj && JSON.stringify(beforeObj) !== JSON.stringify(afterObj)
    })
    .map((afterObj) => {
      const beforeObj = before.objects.find((o) => o.id === afterObj.id)!
      return {
        id: afterObj.id,
        changes: {
          before: beforeObj,
          after: afterObj,
        },
      }
    })

  return diff
}

/**
 * Apply a diff to a scene definition
 */
export function applySceneDiff(
  scene: SceneDefinition,
  diff: SceneDiff
): SceneDefinition {
  const updated = { ...scene }

  if (diff.changes.metadata) {
    updated.metadata = { ...updated.metadata, ...diff.changes.metadata }
  }

  if (diff.changes.camera) {
    updated.camera = { ...updated.camera, ...diff.changes.camera }
  }

  if (diff.changes.background) {
    updated.background = { ...updated.background, ...diff.changes.background }
  }

  if (diff.changes.lighting) {
    updated.lighting = { ...updated.lighting, ...diff.changes.lighting }
  }

  // Apply object changes
  if (diff.changes.objectsAdded || diff.changes.objectsRemoved || diff.changes.objectsModified) {
    let objects = [...updated.objects]

    // Remove objects
    if (diff.changes.objectsRemoved) {
      objects = objects.filter((o) => !diff.changes.objectsRemoved!.includes(o.id))
    }

    // Modify objects
    if (diff.changes.objectsModified) {
      diff.changes.objectsModified.forEach((mod) => {
        const index = objects.findIndex((o) => o.id === mod.id)
        if (index !== -1 && mod.changes.after) {
          objects[index] = mod.changes.after as any
        }
      })
    }

    // Add objects
    if (diff.changes.objectsAdded) {
      // Note: This requires the full object definitions, which aren't in the diff
      // This would need to be enhanced to include full objects for additions
    }

    updated.objects = objects
  }

  return updated
}

/**
 * Validate scene before saving
 */
export function validateSceneForSave(definition: SceneDefinition): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check required fields
  if (!definition.id) errors.push('Missing scene id')
  if (!definition.name) errors.push('Missing scene name')
  if (!definition.version) errors.push('Missing scene version')
  if (!definition.metadata) errors.push('Missing scene metadata')
  if (!definition.camera) errors.push('Missing camera definition')
  if (!definition.background) errors.push('Missing background definition')
  if (!definition.lighting) errors.push('Missing lighting definition')
  if (!definition.objects) errors.push('Missing objects array')

  // Check version format
  if (definition.version && !/^\d+\.\d+\.\d+$/.test(definition.version)) {
    errors.push('Invalid version format (must be semver: x.y.z)')
  }

  // Check for duplicate object IDs
  if (definition.objects) {
    const ids = definition.objects.map((o) => o.id)
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index)
    if (duplicates.length > 0) {
      errors.push(`Duplicate object IDs: ${duplicates.join(', ')}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
