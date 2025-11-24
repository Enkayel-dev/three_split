import { useRef, useState, useMemo, useEffect, useCallback } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'
import { createLiquidGlassMaterial } from '@/materials/LiquidGlassMaterial'
import { useSceneRegistry, type MaterialState, type AnimationState } from '@/registry'

interface GlassPanelProps {
  id?: string
  name?: string
  width?: number
  height?: number
  thickness?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  reducedTransparency?: boolean
  reducedMotion?: boolean
  parentNode?: string
  onClick?: () => void
  onHover?: (hovered: boolean) => void
  children?: React.ReactNode
}

export default function GlassPanel({
  id,
  name,
  width = 0.8,
  height = 0.5,
  thickness = 0.03,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  reducedTransparency = false,
  reducedMotion = false,
  parentNode = 'global',
  onClick,
  onHover,
  children,
}: GlassPanelProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  // Register with scene registry for MCP control
  const {
    updateAnimationState,
    updateMaterialState,
    setAnimationHandler,
    setMaterialHandler,
    setStateHandler,
  } = useSceneRegistry({
    id,
    type: 'GlassPanel',
    name: name || `Panel ${width}x${height}`,
    position,
    rotation,
    scale: [1, 1, 1],
    parentNode,
    visible: true,
    properties: {
      width,
      height,
      thickness,
    },
    meshRef,
  })

  // Set up animation handler for MCP control
  useEffect(() => {
    setAnimationHandler((animation: string, _params?: Record<string, unknown>) => {
      switch (animation) {
        case 'shimmer':
          // Could trigger a shimmer wave effect
          break
        case 'wave':
          // Wave animation
          break
        case 'pulse':
          // Pulse effect
          break
      }
    })
  }, [setAnimationHandler])

  // Handle MCP material updates
  useEffect(() => {
    setMaterialHandler((params: Partial<MaterialState>) => {
      if (!meshRef.current) return
      const mat = meshRef.current.material as THREE.MeshPhysicalMaterial

      if (params.transmission !== undefined) mat.transmission = params.transmission
      if (params.roughness !== undefined) mat.roughness = params.roughness
      if (params.ior !== undefined) mat.ior = params.ior
      if (params.emissiveIntensity !== undefined) mat.emissiveIntensity = params.emissiveIntensity
      if (params.envMapIntensity !== undefined) mat.envMapIntensity = params.envMapIntensity
      if (params.clearcoat !== undefined) mat.clearcoat = params.clearcoat
      if (params.color !== undefined) {
        mat.color.set(params.color)
        // Also tint attenuationColor for glass effect
        if (mat.attenuationColor) mat.attenuationColor.set(params.color)
        // Set emissive for glow effect
        if (mat.emissive) mat.emissive.set(params.color)
      }

      mat.needsUpdate = true
    })
  }, [setMaterialHandler])

  // Handle MCP state updates
  useEffect(() => {
    setStateHandler((state: Partial<AnimationState>) => {
      if (state.hovered !== undefined) setHovered(state.hovered)
      if (state.pressed !== undefined) setPressed(state.pressed)
    })
  }, [setStateHandler])

  // Create material
  const material = useMemo(
    () => createLiquidGlassMaterial({ reducedTransparency }),
    [reducedTransparency]
  )

  // Animation springs
  const { scale } = useSpring({
    scale: pressed ? 0.98 : hovered ? 1.03 : 1,
    config: reducedMotion
      ? { duration: 0 }
      : { tension: 180, friction: 12 },
  })

  // Update material on hover (Fresnel boost simulation via roughness)
  useFrame(() => {
    if (!meshRef.current || reducedMotion) return
    const mat = meshRef.current.material as THREE.MeshPhysicalMaterial
    if (mat.roughness !== undefined) {
      // Slightly decrease roughness on hover for shinier look
      mat.roughness = THREE.MathUtils.lerp(
        mat.roughness,
        hovered ? 0.08 : 0.12,
        0.1
      )
    }

    // Update registry with current state
    updateAnimationState({
      hovered,
      pressed,
      idle: !hovered && !pressed,
      currentScale: [1, 1, 1],
      currentRoughness: mat.roughness || 0.12,
    })

    updateMaterialState({
      roughness: mat.roughness,
      transmission: mat.transmission,
    })
  })

  // Event handlers
  const handlePointerEnter = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(true)
    onHover?.(true)
    document.body.style.cursor = 'pointer'
  }, [onHover])

  const handlePointerLeave = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(false)
    setPressed(false)
    onHover?.(false)
    document.body.style.cursor = 'auto'
  }, [onHover])

  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setPressed(true)
  }, [])

  const handlePointerUp = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setPressed(false)
  }, [])

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onClick?.()
  }, [onClick])

  return (
    <animated.group
      position={position}
      rotation={rotation}
      scale={scale}
    >
      <RoundedBox
        ref={meshRef}
        args={[width, height, thickness]}
        radius={0.04}
        smoothness={4}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
        material={material}
      />
      {children}
    </animated.group>
  )
}
