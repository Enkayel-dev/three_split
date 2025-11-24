import { useRef, useState, useMemo, useEffect, useCallback } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import { RoundedBox, Text } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'
import { createLiquidGlassMaterial } from '@/materials/LiquidGlassMaterial'
import { useSceneRegistry, type MaterialState, type AnimationState } from '@/registry'

interface GlassCardProps {
  id?: string
  name?: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  width?: number
  height?: number
  thickness?: number
  title: string
  subtitle?: string
  reducedMotion?: boolean
  reducedTransparency?: boolean
  parentNode?: string
  onClick?: () => void
}

export default function GlassCard({
  id,
  name,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  width = 0.8,
  height = 0.5,
  thickness = 0.025,
  title,
  subtitle,
  reducedMotion = false,
  reducedTransparency = false,
  parentNode = 'global',
  onClick,
}: GlassCardProps) {
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  // Register with scene registry for MCP control
  const {
    updateAnimationState,
    // updateMaterialState - available for future use
    setAnimationHandler,
    setMaterialHandler,
    setStateHandler,
  } = useSceneRegistry({
    id,
    type: 'GlassCard',
    name: name || title,
    position,
    rotation,
    scale: [1, 1, 1],
    parentNode,
    visible: true,
    properties: {
      title,
      subtitle,
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
        case 'flip':
          // Could trigger a flip animation
          break
        case 'tilt':
          // Tilt the card
          break
        case 'reveal':
          // Reveal animation
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

  // Idle floating animation
  const idleOffset = useRef(Math.random() * Math.PI * 2) // Random phase
  useFrame((state) => {
    if (reducedMotion || !groupRef.current) return
    const t = state.clock.elapsedTime + idleOffset.current
    groupRef.current.position.y = position[1] + Math.sin(t * 0.5) * 0.02
    groupRef.current.rotation.y = rotation[1] + Math.sin(t * 0.3) * 0.02

    // Update registry with current state
    updateAnimationState({
      hovered,
      pressed,
      idle: true,
      currentScale: [1, 1, 1],
    })
  })

  // Interaction springs
  const { scale, rotateX } = useSpring({
    scale: pressed ? 0.95 : hovered ? 1.05 : 1,
    rotateX: hovered ? -0.05 : 0,
    config: reducedMotion
      ? { duration: 0 }
      : { tension: 180, friction: 12 },
  })

  // Event handlers
  const handlePointerEnter = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = 'pointer'
  }, [])

  const handlePointerLeave = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(false)
    setPressed(false)
    document.body.style.cursor = 'auto'
  }, [])

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
    <group ref={groupRef} position={position} rotation={rotation}>
      <animated.group scale={scale} rotation-x={rotateX}>
        {/* Glass panel */}
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

        {/* Title text */}
        <Text
          position={[0, 0.05, thickness / 2 + 0.001]}
          fontSize={0.06}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={width - 0.1}
        >
          {title}
        </Text>

        {/* Subtitle text */}
        {subtitle && (
          <Text
            position={[0, -0.08, thickness / 2 + 0.001]}
            fontSize={0.035}
            color="#aaaaaa"
            anchorX="center"
            anchorY="middle"
            maxWidth={width - 0.1}
          >
            {subtitle}
          </Text>
        )}

        {/* Highlight rim (subtle) */}
        <mesh position={[0, 0, -thickness / 2 - 0.001]}>
          <planeGeometry args={[width - 0.02, height - 0.02]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={hovered ? 0.05 : 0.02}
            side={THREE.BackSide}
          />
        </mesh>
      </animated.group>
    </group>
  )
}
