/**
 * useSceneDefinition Hook
 *
 * Loads scene definitions from JSON files and provides hot reload support in development.
 */

import { useState, useEffect, useCallback } from 'react'
import type { SceneDefinition } from '@/types/sceneDefinition'
import { sceneValidator } from './SceneValidator'

interface UseSceneDefinitionResult {
  definition: SceneDefinition | null
  loading: boolean
  error: Error | null
  validationErrors: string[]
  reload: () => void
}

/**
 * Hook to load and validate scene definitions
 */
export function useSceneDefinition(sceneId: string): UseSceneDefinitionResult {
  const [definition, setDefinition] = useState<SceneDefinition | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const loadScene = useCallback(async () => {
    setLoading(true)
    setError(null)
    setValidationErrors([])

    try {
      // Fetch scene definition
      const response = await fetch(`/scenes/${sceneId}.json`)

      if (!response.ok) {
        throw new Error(`Failed to load scene: ${response.statusText}`)
      }

      const data = await response.json()

      // Validate scene
      const validationResult = sceneValidator.validate(data)

      if (!validationResult.valid) {
        const errorMessages = validationResult.errors.map(
          (err) => `[${err.code}] ${err.message}${err.suggestion ? ` - ${err.suggestion}` : ''}`
        )
        setValidationErrors(errorMessages)
        console.error('Scene validation failed:', validationResult.errors)
      }

      // Log warnings but don't block loading
      if (validationResult.warnings.length > 0) {
        console.warn('Scene validation warnings:', validationResult.warnings)
      }

      // Log info messages
      if (validationResult.info.length > 0) {
        console.info('Scene info:', validationResult.info)
      }

      // Set definition even if there are warnings (but not if there are errors)
      if (validationResult.valid) {
        setDefinition(data as SceneDefinition)
      } else {
        setDefinition(null)
      }
    } catch (err) {
      console.error('Error loading scene:', err)
      setError(err instanceof Error ? err : new Error(String(err)))
      setDefinition(null)
    } finally {
      setLoading(false)
    }
  }, [sceneId])

  // Initial load
  useEffect(() => {
    loadScene()
  }, [loadScene])

  // Hot reload support in development
  useEffect(() => {
    if (import.meta.env.DEV && import.meta.hot) {
      // Listen for file changes
      import.meta.hot.on('vite:beforeUpdate', (payload) => {
        // Check if the updated file is our scene
        const isSceneUpdate = payload.updates.some(
          (update) => update.path.includes(`/scenes/${sceneId}.json`)
        )

        if (isSceneUpdate) {
          console.log(`[HMR] Scene ${sceneId}.json updated, reloading...`)
          loadScene()
        }
      })
    }
  }, [sceneId, loadScene])

  return {
    definition,
    loading,
    error,
    validationErrors,
    reload: loadScene,
  }
}
