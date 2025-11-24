/**
 * Shared types for MCP scene bridge
 */

import type { RegisteredObject, AnimationState, MaterialState } from '@/registry'

// Re-export registry types for convenience
export type { AnimationState, MaterialState }

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
    ior?: number
    thickness?: number
    emissiveIntensity?: number
    envMapIntensity?: number
    clearcoat?: number
  }
}

export interface SceneSnapshot {
  camera: {
    position: [number, number, number]
    lookAt: [number, number, number]
  }
  currentNode: string
  isTransitioning: boolean
  // Dynamic objects created via MCP
  objects: SceneObject[]
  // Static registered objects from scene
  registeredObjects: Array<Omit<RegisteredObject, 'meshRef' | 'materialRef' | 'onAnimationTrigger' | 'onMaterialUpdate' | 'onStateUpdate'>>
}

// Message types
export type BridgeMessageType =
  // Existing types
  | 'get_snapshot'
  | 'snapshot'
  | 'list_objects'
  | 'objects'
  | 'get_object'
  | 'object'
  | 'create_object'
  | 'created'
  | 'edit_object'
  | 'updated'
  | 'delete_object'
  | 'deleted'
  | 'navigate_to'
  | 'navigated'
  | 'set_material'
  | 'material_updated'
  // New types for granular control
  | 'get_registered_objects'
  | 'registered_objects'
  | 'get_animation_state'
  | 'animation_state'
  | 'set_animation_state'
  | 'animation_state_updated'
  | 'get_material_params'
  | 'material_params'
  | 'set_material_params'
  | 'material_params_updated'
  | 'trigger_animation'
  | 'animation_triggered'
  | 'list_animations'
  | 'animations_list'
  | 'error'

export interface BridgeMessage {
  type: BridgeMessageType | string
  payload?: unknown
  requestId?: string
}

export type MessageHandler = (message: BridgeMessage) => void

// Payload types for new commands
export interface GetRegisteredObjectsPayload {
  node?: string
  type?: string
}

export interface SetAnimationStatePayload {
  objectId: string
  state: Partial<AnimationState>
}

export interface GetMaterialParamsPayload {
  objectId: string
}

export interface SetMaterialParamsPayload {
  objectId: string
  params: Partial<MaterialState>
}

export interface TriggerAnimationPayload {
  objectId: string
  animation: string
  params?: Record<string, unknown>
}

export interface ListAnimationsPayload {
  objectId?: string
  type?: string
}

// Response types
export interface AnimationStateResponse {
  objectId: string
  state: AnimationState
}

export interface MaterialParamsResponse {
  objectId: string
  params: MaterialState
}

export interface AnimationsListResponse {
  objectId?: string
  type?: string
  animations: string[]
}

export interface TriggerAnimationResponse {
  success: boolean
  message: string
  objectId: string
  animation: string
}
