import { useRef, useState, useMemo, useEffect, useCallback } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import { RoundedBox, Text } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'
import { createLiquidGlassMaterial } from '@/materials/LiquidGlassMaterial'
import { useSceneRegistry, type MaterialState, type AnimationState } from '@/registry'
import {
  createGlassAnimationState,
  updateGlowPulse,
  setFresnelShiftHovered,
  updateFresnelShift,
  triggerRefractionWave,
  updateRefractionWave,
  createAnimationHandler,
} from '@/animations'
import { useLiquidDeform } from '@/animations/useLiquidDeform'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface GlassButtonProps {
  id?: string
  name?: string
  label: string
  variant?: ButtonVariant
  size?: ButtonSize
  position?: [number, number, number]
  rotation?: [number, number, number]
  disabled?: boolean
  loading?: boolean
  reducedTransparency?: boolean
  reducedMotion?: boolean
  parentNode?: string
  onClick?: () => void
  onHover?: (hovered: boolean) => void
}

// Size configurations
const sizeConfig = {
  sm: { width: 0.15, height: 0.045, thickness: 0.025, fontSize: 0.018 },
  md: { width: 0.2, height: 0.055, thickness: 0.03, fontSize: 0.022 },
  lg: { width: 0.28, height: 0.07, thickness: 0.04, fontSize: 0.028 },
}

export default function GlassButton({
  id,
  name,
  label,
  variant = 'primary',
  size = 'md',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  disabled = false,
  loading = false,
  reducedTransparency = false,
  reducedMotion = false,
  parentNode = 'global',
  onClick,
  onHover,
}: GlassButtonProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  const { width, height, thickness, fontSize } = sizeConfig[size]

  // Store MCP-applied material values to prevent revert on interaction
  const mcpMaterialRef = useRef<Partial<MaterialState>>({
    roughness: 0.08,
    transmission: 0.85,
    color: undefined,
  })

  // Animation state
  const animationState = useRef(createGlassAnimationState())

  // Liquid deform hook for organic movement
  const liquidDeform = useLiquidDeform({
    stiffness: 200,
    damping: 15,
    maxDeform: 0.02,
    reducedMotion,
  })

  // Register with scene registry for MCP control
  const {
    updateAnimationState,
    updateMaterialState,
    setAnimationHandler,
    setMaterialHandler,
    setStateHandler,
  } = useSceneRegistry({
    id,
    type: 'GlassButton',
    name: name || label,
    position,
    rotation,
    scale: [1, 1, 1],
    parentNode,
    visible: true,
    properties: {
      label,
      variant,
      size,
      disabled,
      loading,
    },
    meshRef,
  })

  // Set up animation handler for MCP control
  useEffect(() => {
    const handler = createAnimationHandler(
      animationState.current,
      () => performance.now()
    )
    setAnimationHandler(handler)
  }, [setAnimationHandler])

  // Handle MCP material updates
  useEffect(() => {
    setMaterialHandler((params: Partial<MaterialState>) => {
      if (!meshRef.current) return
      const mat = meshRef.current.material as THREE.MeshPhysicalMaterial

      // Store MCP values to prevent revert
      if (params.transmission !== undefined) {
        mat.transmission = params.transmission
        mcpMaterialRef.current.transmission = params.transmission
      }
      if (params.roughness !== undefined) {
        mat.roughness = params.roughness
        mcpMaterialRef.current.roughness = params.roughness
      }
      if (params.ior !== undefined) mat.ior = params.ior
      if (params.emissiveIntensity !== undefined) mat.emissiveIntensity = params.emissiveIntensity
      if (params.envMapIntensity !== undefined) mat.envMapIntensity = params.envMapIntensity
      if (params.color !== undefined) {
        mat.color.set(params.color)
        mcpMaterialRef.current.color = params.color
        // Also set emissive for glow effect
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

  // Create material based on variant
  const material = useMemo(() => {
    if (reducedTransparency) {
      return createLiquidGlassMaterial({ reducedTransparency: true })
    }

    switch (variant) {
      case 'primary':
        return new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#4A90D9'),
          transparent: true,
          transmission: 0.85,
          roughness: 0.08,
          thickness: thickness,
          ior: 1.5,
          metalness: 0,
          envMapIntensity: 1.5,
          clearcoat: 0.2,
          clearcoatRoughness: 0.1,
          emissive: new THREE.Color('#4A90D9'),
          emissiveIntensity: 0.15,
          side: THREE.DoubleSide,
        })
      case 'secondary':
        return createLiquidGlassMaterial({
          transmission: 0.9,
          roughness: 0.1,
          thickness: thickness,
        })
      case 'ghost':
        return createLiquidGlassMaterial({
          transmission: 0.98,
          roughness: 0.05,
          thickness: thickness * 0.5,
        })
    }
  }, [variant, thickness, reducedTransparency])

  // Animation springs for hover/press with liquid feel
  const { scale: springScale } = useSpring({
    scale: disabled
      ? 1
      : pressed
        ? [1.02, 0.94, 1.01] // Liquid squish - expand X/Z, compress Y
        : hovered
          ? 1.04
          : 1,
    config: reducedMotion
      ? { duration: 0 }
      : pressed
        ? { tension: 350, friction: 18 }
        : { tension: 160, friction: 14, mass: 0.6 },
  })

  // Loading pulse animation
  const [pulse, setPulse] = useState(1)

  // Main animation loop
  useFrame((state, delta) => {
    if (!meshRef.current) return
    const mat = meshRef.current.material as THREE.MeshPhysicalMaterial
    const t = state.clock.elapsedTime

    // Loading pulse
    if (loading && !reducedMotion) {
      setPulse(1 + Math.sin(t * 4) * 0.05)
    }

    // Skip other animations if disabled or reduced motion
    if (reducedMotion || disabled) return

    // Update glow pulse
    const glowIntensity = updateGlowPulse(animationState.current.glowPulse, t, reducedMotion)
    if (variant === 'primary' && mat.emissiveIntensity !== undefined) {
      const baseGlow = hovered ? 0.25 : 0.15
      mat.emissiveIntensity = THREE.MathUtils.lerp(
        mat.emissiveIntensity,
        baseGlow + (glowIntensity - animationState.current.glowPulse.baseIntensity) * 0.5,
        0.1
      )
    }

    // Update fresnel shift
    const { power: _fresnelPower } = updateFresnelShift(
      animationState.current.fresnelShift,
      delta,
      reducedMotion
    )
    // Apply fresnel to clearcoat (simulates fresnel edge glow)
    if (mat.clearcoat !== undefined) {
      mat.clearcoat = THREE.MathUtils.lerp(mat.clearcoat, hovered ? 0.4 : 0.2, 0.1)
    }

    // Update refraction wave
    const iorOffset = updateRefractionWave(animationState.current.refractionWave, delta, reducedMotion)
    if (mat.ior !== undefined) {
      mat.ior = 1.5 + iorOffset
    }

    // Update roughness based on hover
    if (mat.roughness !== undefined) {
      mat.roughness = THREE.MathUtils.lerp(
        mat.roughness,
        hovered ? 0.04 : variant === 'primary' ? 0.08 : 0.1,
        0.15
      )
    }

    // Update animation state in registry
    updateAnimationState({
      hovered,
      pressed,
      loading,
      disabled,
      currentScale: liquidDeform.scale.toArray() as [number, number, number],
      currentEmissiveIntensity: mat.emissiveIntensity || 0,
      currentRoughness: mat.roughness || 0.1,
    })

    // Update material state in registry
    updateMaterialState({
      transmission: mat.transmission,
      roughness: mat.roughness,
      ior: mat.ior,
      emissiveIntensity: mat.emissiveIntensity,
    })
  })

  // Event handlers
  const handlePointerEnter = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (disabled || loading) return
    e.stopPropagation()
    setHovered(true)
    onHover?.(true)
    document.body.style.cursor = 'pointer'

    // Liquid deform hover effect
    liquidDeform.applyHover(true, 0, 0)

    // Fresnel shift
    setFresnelShiftHovered(animationState.current.fresnelShift, true)
  }, [disabled, loading, onHover, liquidDeform])

  const handlePointerLeave = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(false)
    setPressed(false)
    onHover?.(false)
    document.body.style.cursor = 'auto'

    // Reset liquid deform
    liquidDeform.applyHover(false)

    // Reset fresnel
    setFresnelShiftHovered(animationState.current.fresnelShift, false)
  }, [onHover, liquidDeform])

  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (disabled || loading || !hovered || reducedMotion) return

    // Track pointer for liquid deform
    if (e.uv) {
      const x = (e.uv.x - 0.5) * 2
      const y = (e.uv.y - 0.5) * 2
      liquidDeform.applyHover(true, x, y)
    }
  }, [disabled, loading, hovered, reducedMotion, liquidDeform])

  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (disabled || loading) return
    e.stopPropagation()
    setPressed(true)

    // Liquid press effect
    liquidDeform.applyPress(true)
  }, [disabled, loading, liquidDeform])

  const handlePointerUp = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setPressed(false)

    // Release liquid press
    liquidDeform.applyPress(false)
    if (hovered) {
      liquidDeform.applyHover(true)
    }
  }, [hovered, liquidDeform])

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    if (disabled || loading) return
    e.stopPropagation()

    // Trigger refraction wave on click
    if (!reducedMotion) {
      triggerRefractionWave(animationState.current.refractionWave)
      liquidDeform.jiggle(0.5)
    }

    onClick?.()
  }, [disabled, loading, reducedMotion, liquidDeform, onClick])

  // Text color based on variant
  const textColor = variant === 'primary' ? '#ffffff' : '#e0e0e0'

  // Get liquid deform transform
  const deformPosition = liquidDeform.position

  return (
    <animated.group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={springScale.to((s) => (Array.isArray(s) ? s : [s, s, s]) as [number, number, number]).to(
        (x, y, z) => [x * (loading ? pulse : 1), y * (loading ? pulse : 1), z * (loading ? pulse : 1)]
      )}
    >
      {/* Liquid deform offset group */}
      <group position={[deformPosition.x, deformPosition.y, deformPosition.z]}>
        {/* Main button body - pill shape */}
        <RoundedBox
          ref={meshRef}
          args={[width, height, thickness]}
          radius={height / 2}
          smoothness={8}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onClick={handleClick}
          material={material}
        >
          {/* Disabled overlay */}
          {disabled && (
            <meshBasicMaterial
              transparent
              opacity={0.4}
              color="#333333"
              depthWrite={false}
            />
          )}
        </RoundedBox>

        {/* Button label */}
        <Text
          position={[0, 0, thickness / 2 + 0.002]}
          fontSize={fontSize}
          color={disabled ? '#666666' : textColor}
          anchorX="center"
          anchorY="middle"
        >
          {loading ? '...' : label}
        </Text>

        {/* Subtle rim highlight for primary variant */}
        {variant === 'primary' && !disabled && (
          <mesh position={[0, 0, thickness / 2 + 0.001]}>
            <ringGeometry args={[width / 2.2, width / 2.1, 32]} />
            <meshBasicMaterial
              color="#6AB0F0"
              transparent
              opacity={hovered ? 0.5 : 0.25}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* Glow rim effect on hover */}
        {hovered && variant === 'primary' && !disabled && !reducedMotion && (
          <mesh position={[0, 0, -thickness / 2 - 0.001]}>
            <planeGeometry args={[width * 1.3, height * 1.8]} />
            <meshBasicMaterial
              color="#4A90D9"
              transparent
              opacity={0.15}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}
      </group>
    </animated.group>
  )
}
