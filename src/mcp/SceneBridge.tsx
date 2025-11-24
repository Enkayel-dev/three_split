/**
 * WebSocket bridge connecting React app to MCP server
 * Runs a WebSocket server that the MCP server connects to
 */

import { useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@/store'
import type { BridgeMessage, SceneSnapshot, SceneObject } from './types'

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
        const object = state.sceneObjects.find(o => o.id === objectId)
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

      default:
        sendResponse({
          type: 'error',
          payload: `Unknown message type: ${message.type}`,
          requestId: message.requestId,
        })
    }
  }, [getSnapshot])

  useEffect(() => {
    // In browser, we'll use a simple approach - the MCP server will connect to us
    // For development, we create a WebSocket that listens for connections

    // Note: Browser can't create WebSocket server, so we need a different approach
    // The React app will connect to a relay server or use polling
    // For now, we'll set up the client side that connects to the MCP server's relay

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
