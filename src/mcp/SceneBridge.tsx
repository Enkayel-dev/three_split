/**
 * WebSocket bridge connecting React app to MCP server
 * Handles both dynamic objects and registered static objects
 */

import { useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@/store'
import { SceneRegistry } from '@/registry'
import type {
  BridgeMessage,
  SceneSnapshot,
  SceneObject,
  GetRegisteredObjectsPayload,
  SetAnimationStatePayload,
  GetMaterialParamsPayload,
  SetMaterialParamsPayload,
  TriggerAnimationPayload,
  ListAnimationsPayload,
} from './types'

const WS_PORT = 3001

export function useSceneBridge() {
  const wsRef = useRef<WebSocket | null>(null)
  const serverRef = useRef<{ close: () => void } | null>(null)

  // Get store state and actions
  const getSnapshot = useCallback((): SceneSnapshot => {
    const state = useAppStore.getState()
    return {
      camera: {
        position: [0, 1.5, 4], // Would come from camera controller
        lookAt: [0, 1.2, 0],
      },
      currentNode: state.currentNode,
      isTransitioning: state.isTransitioning,
      objects: state.sceneObjects,
      registeredObjects: SceneRegistry.getSnapshot(),
    }
  }, [])

  const handleMessage = useCallback((message: BridgeMessage, sendResponse: (msg: BridgeMessage) => void) => {
    const state = useAppStore.getState()

    switch (message.type) {
      case 'get_snapshot': {
        sendResponse({
          type: 'snapshot',
          payload: getSnapshot(),
          requestId: message.requestId,
        })
        break
      }

      case 'list_objects': {
        const filter = message.payload as { node?: string; type?: string } | undefined
        let objects = state.sceneObjects
        if (filter?.node) {
          objects = objects.filter(o => o.parentNode === filter.node)
        }
        if (filter?.type) {
          objects = objects.filter(o => o.type === filter.type)
        }
        sendResponse({
          type: 'objects',
          payload: objects,
          requestId: message.requestId,
        })
        break
      }

      case 'get_object': {
        const { objectId } = message.payload as { objectId: string }
        // Check dynamic objects first
        let object: SceneObject | undefined = state.sceneObjects.find(o => o.id === objectId)
        // Then check registered objects
        if (!object) {
          const registered = SceneRegistry.get(objectId)
          if (registered) {
            object = {
              id: registered.id,
              type: registered.type as SceneObject['type'],
              position: registered.position,
              rotation: registered.rotation,
              scale: registered.scale,
              properties: registered.properties,
              parentNode: registered.parentNode,
              visible: registered.visible,
              material: registered.materialState,
            }
          }
        }
        sendResponse({
          type: 'object',
          payload: object || null,
          requestId: message.requestId,
        })
        break
      }

      case 'create_object': {
        const params = message.payload as Partial<SceneObject> & { type: string; position: [number, number, number] }
        const newObject: SceneObject = {
          id: `mcp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: params.type as SceneObject['type'],
          position: params.position,
          rotation: params.rotation || [0, 0, 0],
          scale: params.scale || [1, 1, 1],
          properties: params.properties || {},
          parentNode: params.parentNode || state.currentNode,
          visible: true,
        }
        state.addSceneObject(newObject)
        sendResponse({
          type: 'created',
          payload: { success: true, objectId: newObject.id, message: `Created ${params.type}` },
          requestId: message.requestId,
        })
        break
      }

      case 'edit_object': {
        const { objectId, ...updates } = message.payload as { objectId: string } & Partial<SceneObject>
        state.updateSceneObject(objectId, updates)
        sendResponse({
          type: 'updated',
          payload: { success: true, message: 'Object updated' },
          requestId: message.requestId,
        })
        break
      }

      case 'delete_object': {
        const { objectId } = message.payload as { objectId: string }
        state.removeSceneObject(objectId)
        sendResponse({
          type: 'deleted',
          payload: { success: true, message: 'Object deleted' },
          requestId: message.requestId,
        })
        break
      }

      case 'navigate_to': {
        const { node } = message.payload as { node?: string }
        if (node) {
          state.navigateTo(node as 'home' | 'consulting' | 'software' | 'construction' | 'contact')
        }
        sendResponse({
          type: 'navigated',
          payload: { success: true, message: `Navigating to ${node}` },
          requestId: message.requestId,
        })
        break
      }

      case 'set_material': {
        const { objectId, ...materialProps } = message.payload as { objectId: string; preset?: string; transmission?: number; roughness?: number; color?: string }
        state.updateSceneObject(objectId, { material: materialProps })
        sendResponse({
          type: 'material_updated',
          payload: { success: true, message: 'Material updated' },
          requestId: message.requestId,
        })
        break
      }

      // New commands for registered objects
      case 'get_registered_objects': {
        const filter = message.payload as GetRegisteredObjectsPayload | undefined
        let objects = SceneRegistry.getSnapshot()
        if (filter?.node) {
          objects = objects.filter(o => o.parentNode === filter.node || o.parentNode === 'global')
        }
        if (filter?.type) {
          objects = objects.filter(o => o.type === filter.type)
        }
        sendResponse({
          type: 'registered_objects',
          payload: objects,
          requestId: message.requestId,
        })
        break
      }

      case 'get_animation_state': {
        const { objectId } = message.payload as { objectId: string }
        const obj = SceneRegistry.get(objectId)
        if (obj) {
          sendResponse({
            type: 'animation_state',
            payload: { objectId, state: obj.animationState },
            requestId: message.requestId,
          })
        } else {
          sendResponse({
            type: 'error',
            payload: `Object not found: ${objectId}`,
            requestId: message.requestId,
          })
        }
        break
      }

      case 'set_animation_state': {
        const { objectId, state: animState } = message.payload as SetAnimationStatePayload
        SceneRegistry.updateAnimationState(objectId, animState)
        sendResponse({
          type: 'animation_state_updated',
          payload: { success: true, message: 'Animation state updated', objectId },
          requestId: message.requestId,
        })
        break
      }

      case 'get_material_params': {
        const { objectId } = message.payload as GetMaterialParamsPayload
        const obj = SceneRegistry.get(objectId)
        if (obj) {
          sendResponse({
            type: 'material_params',
            payload: { objectId, params: obj.materialState },
            requestId: message.requestId,
          })
        } else {
          sendResponse({
            type: 'error',
            payload: `Object not found: ${objectId}`,
            requestId: message.requestId,
          })
        }
        break
      }

      case 'set_material_params': {
        const { objectId, params } = message.payload as SetMaterialParamsPayload
        SceneRegistry.updateMaterialState(objectId, params)
        sendResponse({
          type: 'material_params_updated',
          payload: { success: true, message: 'Material params updated', objectId },
          requestId: message.requestId,
        })
        break
      }

      case 'trigger_animation': {
        const { objectId, animation, params } = message.payload as TriggerAnimationPayload
        const success = SceneRegistry.triggerAnimation(objectId, animation, params)
        sendResponse({
          type: 'animation_triggered',
          payload: {
            success,
            message: success ? `Triggered ${animation}` : 'Object not found or no animation handler',
            objectId,
            animation,
          },
          requestId: message.requestId,
        })
        break
      }

      case 'list_animations': {
        const payload = message.payload as ListAnimationsPayload | undefined
        const objectId = payload?.objectId
        const type = payload?.type
        let animations: string[] = []
        let responseType = type

        if (objectId) {
          const obj = SceneRegistry.get(objectId)
          if (obj) {
            animations = SceneRegistry.getAvailableAnimations(obj.type)
            responseType = obj.type
          }
        } else if (type) {
          animations = SceneRegistry.getAvailableAnimations(type as any)
        } else {
          // Return all unique animations
          const allTypes = ['GlassButton', 'GlassCard', 'GlassPanel'] as const
          const allAnimations = new Set<string>()
          allTypes.forEach(t => {
            SceneRegistry.getAvailableAnimations(t).forEach(a => allAnimations.add(a))
          })
          animations = Array.from(allAnimations)
        }

        sendResponse({
          type: 'animations_list',
          payload: { objectId, type: responseType, animations },
          requestId: message.requestId,
        })
        break
      }

      default:
        sendResponse({
          type: 'error',
          payload: `Unknown message type: ${message.type}`,
          requestId: message.requestId,
        })
    }
  }, [getSnapshot])

  useEffect(() => {
    const connectToRelay = () => {
      try {
        const ws = new WebSocket(`ws://localhost:${WS_PORT}`)

        ws.onopen = () => {
          console.log('MCP Bridge: Connected to relay server')
          wsRef.current = ws
        }

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as BridgeMessage
            handleMessage(message, (response) => {
              ws.send(JSON.stringify(response))
            })
          } catch (e) {
            console.error('MCP Bridge: Failed to parse message', e)
          }
        }

        ws.onclose = () => {
          console.log('MCP Bridge: Disconnected, reconnecting in 3s...')
          wsRef.current = null
          setTimeout(connectToRelay, 3000)
        }

        ws.onerror = () => {
          // Silent fail - MCP server may not be running
        }
      } catch {
        // WebSocket connection failed, retry later
        setTimeout(connectToRelay, 5000)
      }
    }

    connectToRelay()

    return () => {
      wsRef.current?.close()
      serverRef.current?.close()
    }
  }, [handleMessage])

  return null
}

// Component version for use in React tree
export default function SceneBridge() {
  useSceneBridge()
  return null
}
