import { useRef, useState, useMemo } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'
import { createLiquidGlassMaterial } from '@/materials/LiquidGlassMaterial'

interface GlassPanelProps {
  width?: number
  height?: number
  thickness?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  reducedTransparency?: boolean
  reducedMotion?: boolean
  onClick?: () => void
  onHover?: (hovered: boolean) => void
  children?: React.ReactNode
}

export default function GlassPanel({
  width = 0.8,
  height = 0.5,
  thickness = 0.03,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  reducedTransparency = false,
  reducedMotion = false,
  onClick,
  onHover,
  children,
}: GlassPanelProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

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
  })

  // Event handlers
  const handlePointerEnter = (e: ThreeEvent<PointerEvent>) => {
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
    e.stopPropagation()
    setPressed(true)
  }

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setPressed(false)
  }

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onClick?.()
  }

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
