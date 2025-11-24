/**
 * Hook for liquid-like deformation effects on glass components
 * Creates a "surface tension" feel when interacting with glass elements
 */

import { useRef, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface UseLiquidDeformProps {
  stiffness?: number
  damping?: number
  maxDeform?: number
  reducedMotion?: boolean
}

interface LiquidDeformState {
  // Current deformation
  position: THREE.Vector3
  scale: THREE.Vector3
  // Target values
  targetPosition: THREE.Vector3
  targetScale: THREE.Vector3
  // Velocity for spring physics
  positionVelocity: THREE.Vector3
  scaleVelocity: THREE.Vector3
}

export function useLiquidDeform({
  stiffness = 180,
  damping = 14,
  maxDeform = 0.1,
  reducedMotion = false,
}: UseLiquidDeformProps = {}) {
  const state = useRef<LiquidDeformState>({
    position: new THREE.Vector3(0, 0, 0),
    scale: new THREE.Vector3(1, 1, 1),
    targetPosition: new THREE.Vector3(0, 0, 0),
    targetScale: new THREE.Vector3(1, 1, 1),
    positionVelocity: new THREE.Vector3(0, 0, 0),
    scaleVelocity: new THREE.Vector3(0, 0, 0),
  })

  const baseScale = useRef(new THREE.Vector3(1, 1, 1))

  // Spring physics update
  const updateSpring = useCallback((
    current: THREE.Vector3,
    target: THREE.Vector3,
    velocity: THREE.Vector3,
    delta: number
  ) => {
    if (reducedMotion) {
      current.copy(target)
      velocity.set(0, 0, 0)
      return
    }

    // Spring force
    const dx = target.x - current.x
    const dy = target.y - current.y
    const dz = target.z - current.z

    // Apply spring acceleration
    velocity.x += dx * stiffness * delta
    velocity.y += dy * stiffness * delta
    velocity.z += dz * stiffness * delta

    // Apply damping
    velocity.multiplyScalar(Math.max(0, 1 - damping * delta))

    // Update position
    current.add(velocity.clone().multiplyScalar(delta))
  }, [stiffness, damping, reducedMotion])

  // Animation frame update
  useFrame((_, delta) => {
    updateSpring(
      state.current.position,
      state.current.targetPosition,
      state.current.positionVelocity,
      delta
    )

    updateSpring(
      state.current.scale,
      state.current.targetScale,
      state.current.scaleVelocity,
      delta
    )
  })

  // Set target position offset (for hover wobble)
  const setPositionOffset = useCallback((x: number, y: number, z: number) => {
    state.current.targetPosition.set(
      THREE.MathUtils.clamp(x, -maxDeform, maxDeform),
      THREE.MathUtils.clamp(y, -maxDeform, maxDeform),
      THREE.MathUtils.clamp(z, -maxDeform, maxDeform)
    )
  }, [maxDeform])

  // Set target scale (for press effect)
  const setScale = useCallback((x: number, y: number, z: number) => {
    state.current.targetScale.set(
      baseScale.current.x * x,
      baseScale.current.y * y,
      baseScale.current.z * z
    )
  }, [])

  // Set base scale
  const setBaseScale = useCallback((x: number, y: number, z: number) => {
    baseScale.current.set(x, y, z)
    state.current.targetScale.copy(baseScale.current)
  }, [])

  // Reset to neutral
  const reset = useCallback(() => {
    state.current.targetPosition.set(0, 0, 0)
    state.current.targetScale.copy(baseScale.current)
  }, [])

  // Hover effect - creates subtle wobble
  const applyHover = useCallback((hovered: boolean, pointerX = 0, pointerY = 0) => {
    if (hovered && !reducedMotion) {
      // Create a slight offset based on pointer position
      setPositionOffset(
        pointerX * maxDeform * 0.5,
        pointerY * maxDeform * 0.5,
        maxDeform * 0.2
      )
      setScale(1.03, 1.03, 1.01)
    } else {
      reset()
    }
  }, [setPositionOffset, setScale, reset, maxDeform, reducedMotion])

  // Press effect - squash and stretch
  const applyPress = useCallback((pressed: boolean) => {
    if (pressed && !reducedMotion) {
      // Squash effect: compress Y, expand X/Z
      setScale(1.02, 0.96, 1.02)
      setPositionOffset(0, -maxDeform * 0.3, 0)
    } else {
      reset()
    }
  }, [setScale, setPositionOffset, reset, maxDeform, reducedMotion])

  // Jiggle effect - triggered on interaction
  const jiggle = useCallback((intensity = 1) => {
    if (reducedMotion) return

    // Add some velocity to create a jiggle
    state.current.positionVelocity.set(
      (Math.random() - 0.5) * intensity * 2,
      (Math.random() - 0.5) * intensity * 2,
      (Math.random() - 0.5) * intensity
    )
  }, [reducedMotion])

  // Get current values for applying to mesh
  const getTransform = useCallback(() => ({
    position: state.current.position.toArray() as [number, number, number],
    scale: state.current.scale.toArray() as [number, number, number],
  }), [])

  // Get current position value (reactive)
  const position = state.current.position
  const scale = state.current.scale

  return {
    position,
    scale,
    getTransform,
    setPositionOffset,
    setScale,
    setBaseScale,
    reset,
    applyHover,
    applyPress,
    jiggle,
  }
}

/**
 * Hook for tracking pointer position relative to a mesh
 * Useful for liquid deform effects
 */
export function usePointerTracking() {
  const pointerRef = useRef({ x: 0, y: 0, inside: false })

  const onPointerMove = useCallback((event: THREE.Event & { uv?: THREE.Vector2 }) => {
    if (event.uv) {
      // Convert UV (0-1) to centered coordinates (-1 to 1)
      pointerRef.current.x = (event.uv.x - 0.5) * 2
      pointerRef.current.y = (event.uv.y - 0.5) * 2
      pointerRef.current.inside = true
    }
  }, [])

  const onPointerLeave = useCallback(() => {
    pointerRef.current.inside = false
    pointerRef.current.x = 0
    pointerRef.current.y = 0
  }, [])

  return {
    pointer: pointerRef.current,
    onPointerMove,
    onPointerLeave,
  }
}
