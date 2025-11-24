/**
 * Scene Registry - Tracks all objects in the 3D scene for MCP visibility
 * Allows Claude Desktop to "see" and control both static and dynamic objects
 */

import * as THREE from 'three'

export type RegisteredObjectType =
  | 'GlassPanel'
  | 'GlassCard'
  | 'GlassButton'
  | 'GlassToolbar'
  | 'GlassModal'
  | 'FloatingLogo'
  | 'Text3D'
  | 'Box'
  | 'Sphere'
  | 'Cylinder'
  | 'Custom'

export interface AnimationState {
  idle: boolean
  hovered: boolean
  pressed: boolean
  loading: boolean
  disabled: boolean
  // Current animation values
  currentScale: [number, number, number]
  currentEmissiveIntensity: number
  currentRoughness: number
}

export interface MaterialState {
  transmission?: number
  roughness?: number
  thickness?: number
  ior?: number
  emissiveIntensity?: number
  color?: string
  envMapIntensity?: number
  clearcoat?: number
}

export interface RegisteredObject {
  id: string
  type: RegisteredObjectType
  name: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  parentNode: string
  visible: boolean
  properties: Record<string, unknown>
  // Live references
  meshRef?: React.RefObject<THREE.Mesh | THREE.Group>
  materialRef?: React.RefObject<THREE.Material>
  // State
  animationState: AnimationState
  materialState: MaterialState
  // Callbacks for MCP control
  onAnimationTrigger?: (animation: string, params?: Record<string, unknown>) => void
  onMaterialUpdate?: (params: Partial<MaterialState>) => void
  onStateUpdate?: (state: Partial<AnimationState>) => void
}

type RegistryListener = (objects: RegisteredObject[]) => void

class SceneRegistryClass {
  private objects: Map<string, RegisteredObject> = new Map()
  private listeners: Set<RegistryListener> = new Set()
  private idCounter = 0

  /**
   * Generate a unique ID for an object
   */
  generateId(prefix: string = 'obj'): string {
    return `${prefix}_${++this.idCounter}_${Date.now().toString(36)}`
  }

  /**
   * Register an object with the registry
   */
  register(object: Omit<RegisteredObject, 'id'> & { id?: string }): string {
    const id = object.id || this.generateId(object.type.toLowerCase())
    const registeredObject: RegisteredObject = {
      ...object,
      id,
      animationState: object.animationState || {
        idle: true,
        hovered: false,
        pressed: false,
        loading: false,
        disabled: false,
        currentScale: [1, 1, 1],
        currentEmissiveIntensity: 0,
        currentRoughness: 0.1,
      },
      materialState: object.materialState || {},
    }

    this.objects.set(id, registeredObject)
    this.notifyListeners()
    return id
  }

  /**
   * Unregister an object
   */
  unregister(id: string): void {
    this.objects.delete(id)
    this.notifyListeners()
  }

  /**
   * Update an object's properties
   */
  update(id: string, updates: Partial<RegisteredObject>): void {
    const obj = this.objects.get(id)
    if (obj) {
      this.objects.set(id, { ...obj, ...updates })
      this.notifyListeners()
    }
  }

  /**
   * Update animation state for an object
   */
  updateAnimationState(id: string, state: Partial<AnimationState>): void {
    const obj = this.objects.get(id)
    if (obj) {
      obj.animationState = { ...obj.animationState, ...state }
      obj.onStateUpdate?.(state)
      this.notifyListeners()
    }
  }

  /**
   * Update material state for an object
   */
  updateMaterialState(id: string, state: Partial<MaterialState>): void {
    const obj = this.objects.get(id)
    if (obj) {
      obj.materialState = { ...obj.materialState, ...state }
      obj.onMaterialUpdate?.(state)
      this.notifyListeners()
    }
  }

  /**
   * Trigger an animation on an object
   */
  triggerAnimation(id: string, animation: string, params?: Record<string, unknown>): boolean {
    const obj = this.objects.get(id)
    if (obj?.onAnimationTrigger) {
      obj.onAnimationTrigger(animation, params)
      return true
    }
    return false
  }

  /**
   * Get an object by ID
   */
  get(id: string): RegisteredObject | undefined {
    return this.objects.get(id)
  }

  /**
   * Get all registered objects
   */
  getAll(): RegisteredObject[] {
    return Array.from(this.objects.values())
  }

  /**
   * Get objects filtered by type
   */
  getByType(type: RegisteredObjectType): RegisteredObject[] {
    return this.getAll().filter(obj => obj.type === type)
  }

  /**
   * Get objects filtered by parent node
   */
  getByNode(node: string): RegisteredObject[] {
    return this.getAll().filter(obj => obj.parentNode === node || obj.parentNode === 'global')
  }

  /**
   * Get objects matching a filter
   */
  filter(predicate: (obj: RegisteredObject) => boolean): RegisteredObject[] {
    return this.getAll().filter(predicate)
  }

  /**
   * Subscribe to registry changes
   */
  subscribe(listener: RegistryListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Get a serializable snapshot for MCP
   */
  getSnapshot(): Array<Omit<RegisteredObject, 'meshRef' | 'materialRef' | 'onAnimationTrigger' | 'onMaterialUpdate' | 'onStateUpdate'>> {
    return this.getAll().map(obj => ({
      id: obj.id,
      type: obj.type,
      name: obj.name,
      position: obj.position,
      rotation: obj.rotation,
      scale: obj.scale,
      parentNode: obj.parentNode,
      visible: obj.visible,
      properties: obj.properties,
      animationState: obj.animationState,
      materialState: obj.materialState,
    }))
  }

  /**
   * Get available animations for an object type
   */
  getAvailableAnimations(type: RegisteredObjectType): string[] {
    const baseAnimations = ['pulse', 'fadeIn', 'fadeOut', 'shake']

    switch (type) {
      case 'GlassButton':
        return [...baseAnimations, 'ripple', 'glow', 'liquidDeform', 'fresnelShift', 'refractionWave']
      case 'GlassCard':
        return [...baseAnimations, 'flip', 'tilt', 'reveal']
      case 'GlassPanel':
        return [...baseAnimations, 'shimmer', 'wave']
      default:
        return baseAnimations
    }
  }

  /**
   * Clear all registered objects
   */
  clear(): void {
    this.objects.clear()
    this.notifyListeners()
  }

  private notifyListeners(): void {
    const objects = this.getAll()
    this.listeners.forEach(listener => listener(objects))
  }
}

// Singleton instance
export const SceneRegistry = new SceneRegistryClass()

// React hook for using the registry
import { useEffect, useRef, useCallback } from 'react'

export function useSceneRegistry(
  config: Omit<RegisteredObject, 'id' | 'animationState' | 'materialState'> & {
    id?: string
    animationState?: Partial<AnimationState>
    materialState?: Partial<MaterialState>
  }
): {
  registryId: string
  updatePosition: (position: [number, number, number]) => void
  updateAnimationState: (state: Partial<AnimationState>) => void
  updateMaterialState: (state: Partial<MaterialState>) => void
  setAnimationHandler: (handler: (animation: string, params?: Record<string, unknown>) => void) => void
  setMaterialHandler: (handler: (params: Partial<MaterialState>) => void) => void
  setStateHandler: (handler: (state: Partial<AnimationState>) => void) => void
} {
  const idRef = useRef<string | null>(null)
  const handlersRef = useRef<{
    onAnimationTrigger?: (animation: string, params?: Record<string, unknown>) => void
    onMaterialUpdate?: (params: Partial<MaterialState>) => void
    onStateUpdate?: (state: Partial<AnimationState>) => void
  }>({})

  // Register on mount
  useEffect(() => {
    const id = SceneRegistry.register({
      ...config,
      animationState: {
        idle: true,
        hovered: false,
        pressed: false,
        loading: false,
        disabled: false,
        currentScale: [1, 1, 1],
        currentEmissiveIntensity: 0,
        currentRoughness: 0.1,
        ...config.animationState,
      },
      materialState: config.materialState || {},
      onAnimationTrigger: (animation, params) => handlersRef.current.onAnimationTrigger?.(animation, params),
      onMaterialUpdate: (params) => handlersRef.current.onMaterialUpdate?.(params),
      onStateUpdate: (state) => handlersRef.current.onStateUpdate?.(state),
    })
    idRef.current = id

    return () => {
      if (idRef.current) {
        SceneRegistry.unregister(idRef.current)
      }
    }
  }, []) // Only run on mount/unmount

  // Update position
  const updatePosition = useCallback((position: [number, number, number]) => {
    if (idRef.current) {
      SceneRegistry.update(idRef.current, { position })
    }
  }, [])

  // Update animation state
  const updateAnimationState = useCallback((state: Partial<AnimationState>) => {
    if (idRef.current) {
      SceneRegistry.updateAnimationState(idRef.current, state)
    }
  }, [])

  // Update material state
  const updateMaterialState = useCallback((state: Partial<MaterialState>) => {
    if (idRef.current) {
      SceneRegistry.updateMaterialState(idRef.current, state)
    }
  }, [])

  // Set handlers
  const setAnimationHandler = useCallback((handler: (animation: string, params?: Record<string, unknown>) => void) => {
    handlersRef.current.onAnimationTrigger = handler
  }, [])

  const setMaterialHandler = useCallback((handler: (params: Partial<MaterialState>) => void) => {
    handlersRef.current.onMaterialUpdate = handler
  }, [])

  const setStateHandler = useCallback((handler: (state: Partial<AnimationState>) => void) => {
    handlersRef.current.onStateUpdate = handler
  }, [])

  return {
    registryId: idRef.current || '',
    updatePosition,
    updateAnimationState,
    updateMaterialState,
    setAnimationHandler,
    setMaterialHandler,
    setStateHandler,
  }
}
