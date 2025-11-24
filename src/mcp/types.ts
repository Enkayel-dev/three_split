/**
 * Shared types for MCP scene bridge
 */

export interface SceneObject {
  id: string
  type: 'GlassPanel' | 'GlassCard' | 'GlassButton' | 'Box' | 'Sphere' | 'Cylinder' | 'Text3D'
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  properties: Record<string, unknown>
  parentNode: string
  visible: boolean
  material?: {
    preset?: string
    transmission?: number
    roughness?: number
    color?: string
  }
}

export interface SceneSnapshot {
  camera: {
    position: [number, number, number]
    lookAt: [number, number, number]
  }
  currentNode: string
  isTransitioning: boolean
  objects: SceneObject[]
}

export interface BridgeMessage {
  type: string
  payload?: unknown
  requestId?: string
}

export type MessageHandler = (message: BridgeMessage) => void
