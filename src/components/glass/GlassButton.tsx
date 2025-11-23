import { useRef, useState, useMemo } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import { RoundedBox, Text } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'
import { createLiquidGlassMaterial } from '@/materials/LiquidGlassMaterial'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface GlassButtonProps {
  label: string
  variant?: ButtonVariant
  size?: ButtonSize
  position?: [number, number, number]
  rotation?: [number, number, number]
  disabled?: boolean
  loading?: boolean
  reducedTransparency?: boolean
  reducedMotion?: boolean
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
  label,
  variant = 'primary',
  size = 'md',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  disabled = false,
  loading = false,
  reducedTransparency = false,
  reducedMotion = false,
  onClick,
  onHover,
}: GlassButtonProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  const { width, height, thickness, fontSize } = sizeConfig[size]

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

  // Animation springs for hover/press
  const { scale } = useSpring({
    scale: disabled
      ? 1
      : pressed
        ? [1, 0.95, 1] // Squeeze Y axis
        : hovered
          ? 1.05
          : 1,
    config: reducedMotion
      ? { duration: 0 }
      : pressed
        ? { tension: 300, friction: 20 }
        : { tension: 180, friction: 12, mass: 0.5 },
  })

  // Loading pulse animation
  const [pulse, setPulse] = useState(1)
  useFrame((state) => {
    if (loading && !reducedMotion) {
      const t = state.clock.elapsedTime
      setPulse(1 + Math.sin(t * 4) * 0.05)
    }
  })

  // Update material on hover
  useFrame(() => {
    if (!meshRef.current || reducedMotion || disabled) return
    const mat = meshRef.current.material as THREE.MeshPhysicalMaterial

    if (mat.roughness !== undefined) {
      mat.roughness = THREE.MathUtils.lerp(
        mat.roughness,
        hovered ? 0.04 : variant === 'primary' ? 0.08 : 0.1,
        0.15
      )
    }

    // Boost emissive on hover for primary buttons
    if (variant === 'primary' && mat.emissiveIntensity !== undefined) {
      mat.emissiveIntensity = THREE.MathUtils.lerp(
        mat.emissiveIntensity,
        hovered ? 0.25 : 0.15,
        0.1
      )
    }
  })

  // Event handlers
  const handlePointerEnter = (e: ThreeEvent<PointerEvent>) => {
    if (disabled || loading) return
    e.stopPropagation()
    setHovered(true)
    onHover?.(true)
    document.body.style.cursor = 'pointer'
  }

  const handlePointerLeave = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(false)
    setPressed(false)
    onHover?.(false)
    document.body.style.cursor = 'auto'
  }

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (disabled || loading) return
    e.stopPropagation()
    setPressed(true)
  }

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setPressed(false)
  }

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (disabled || loading) return
    e.stopPropagation()
    onClick?.()
  }

  // Text color based on variant
  const textColor = variant === 'primary' ? '#ffffff' : '#e0e0e0'

  return (
    <animated.group
      position={position}
      rotation={rotation}
      scale={scale.to((s) => (Array.isArray(s) ? s : [s, s, s]) as [number, number, number]).to(
        (x, y, z) => [x * (loading ? pulse : 1), y * (loading ? pulse : 1), z * (loading ? pulse : 1)]
      )}
    >
      {/* Main button body - pill shape */}
      <RoundedBox
        ref={meshRef}
        args={[width, height, thickness]}
        radius={height / 2} // Full pill radius
        smoothness={8}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
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
        font="/fonts/Inter-Medium.woff"
        outlineWidth={0}
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
            opacity={hovered ? 0.4 : 0.2}
            depthWrite={false}
          />
        </mesh>
      )}
    </animated.group>
  )
}
