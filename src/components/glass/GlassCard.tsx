import { useRef, useState, useMemo } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import { RoundedBox, Text } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'
import { createLiquidGlassMaterial } from '@/materials/LiquidGlassMaterial'

interface GlassCardProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  width?: number
  height?: number
  thickness?: number
  title: string
  subtitle?: string
  reducedMotion?: boolean
  reducedTransparency?: boolean
  onClick?: () => void
}

export default function GlassCard({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  width = 0.8,
  height = 0.5,
  thickness = 0.025,
  title,
  subtitle,
  reducedMotion = false,
  reducedTransparency = false,
  onClick,
}: GlassCardProps) {
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

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
  const handlePointerEnter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = 'pointer'
  }

  const handlePointerLeave = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(false)
    setPressed(false)
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
          font="/fonts/inter-medium.woff"
          characters="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
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
            font="/fonts/inter-regular.woff"
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
