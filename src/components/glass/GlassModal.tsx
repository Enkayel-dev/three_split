import { useRef, useMemo, useEffect } from 'react'
import { ThreeEvent } from '@react-three/fiber'
import { RoundedBox, Text } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'
import { createLiquidGlassMaterial } from '@/materials/LiquidGlassMaterial'

interface GlassModalProps {
  isOpen: boolean
  title?: string
  width?: number
  height?: number
  thickness?: number
  position?: [number, number, number]
  originPosition?: [number, number, number] // Position to morph from
  originScale?: number // Scale to morph from
  reducedTransparency?: boolean
  reducedMotion?: boolean
  onClose?: () => void
  children?: React.ReactNode
}

export default function GlassModal({
  isOpen,
  title,
  width = 1.8,
  height = 1.2,
  thickness = 0.04,
  position = [0, 1.2, 0],
  originPosition = [0, 1.2, 0],
  originScale = 0.3,
  reducedTransparency = false,
  reducedMotion = false,
  onClose,
  children,
}: GlassModalProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const backdropRef = useRef<THREE.Mesh>(null)

  // Create material
  const material = useMemo(() => {
    if (reducedTransparency) {
      return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0.12, 0.12, 0.16),
        transparent: true,
        opacity: 0.95,
        roughness: 0.4,
        metalness: 0,
        side: THREE.DoubleSide,
      })
    }

    return createLiquidGlassMaterial({
      transmission: 0.88,
      roughness: 0.15,
      thickness: thickness,
    })
  }, [thickness, reducedTransparency])

  // Animation springs for morph effect
  const springs = useSpring({
    scale: isOpen ? 1 : originScale,
    positionX: isOpen ? position[0] : originPosition[0],
    positionY: isOpen ? position[1] : originPosition[1],
    positionZ: isOpen ? position[2] : originPosition[2],
    opacity: isOpen ? 1 : 0,
    backdropOpacity: isOpen ? 0.5 : 0,
    config: reducedMotion
      ? { duration: 0 }
      : {
          tension: 180,
          friction: 22,
          mass: 1,
        },
  })

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Backdrop click handler
  const handleBackdropClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onClose?.()
  }

  // Close button click handler
  const handleCloseClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onClose?.()
  }

  if (!isOpen && springs.opacity.get() < 0.01) {
    return null
  }

  return (
    <>
      {/* Backdrop */}
      <animated.mesh
        ref={backdropRef}
        position={[0, 1, -0.5]}
        onClick={handleBackdropClick}
        visible={isOpen}
      >
        <planeGeometry args={[10, 10]} />
        <animated.meshBasicMaterial
          color="#000000"
          transparent
          opacity={springs.backdropOpacity}
          depthWrite={false}
        />
      </animated.mesh>

      {/* Modal Panel */}
      <animated.group
        position-x={springs.positionX}
        position-y={springs.positionY}
        position-z={springs.positionZ}
        scale={springs.scale}
      >
        {/* Main modal body */}
        <RoundedBox
          ref={meshRef}
          args={[width, height, thickness]}
          radius={0.06}
          smoothness={4}
          material={material}
        />

        {/* Header bar */}
        <group position={[0, height / 2 - 0.06, thickness / 2 + 0.002]}>
          {/* Title */}
          {title && (
            <Text
              position={[0, 0, 0]}
              fontSize={0.05}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {title}
            </Text>
          )}

          {/* Close button */}
          <group
            position={[width / 2 - 0.08, 0, 0]}
            onClick={handleCloseClick}
            onPointerEnter={() => (document.body.style.cursor = 'pointer')}
            onPointerLeave={() => (document.body.style.cursor = 'auto')}
          >
            <mesh>
              <circleGeometry args={[0.03, 16]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
            </mesh>
            <Text
              position={[0, 0, 0.001]}
              fontSize={0.035}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              ×
            </Text>
          </group>
        </group>

        {/* Divider line */}
        <mesh position={[0, height / 2 - 0.12, thickness / 2 + 0.001]}>
          <planeGeometry args={[width - 0.1, 0.002]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
        </mesh>

        {/* Content area */}
        <group position={[0, -0.06, thickness / 2 + 0.01]}>{children}</group>

        {/* Footer area */}
        <group position={[0, -height / 2 + 0.06, thickness / 2 + 0.002]}>
          {/* Divider line */}
          <mesh position={[0, 0.03, -0.001]}>
            <planeGeometry args={[width - 0.1, 0.002]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
          </mesh>
        </group>

        {/* Edge highlight */}
        <mesh position={[0, 0, thickness / 2 + 0.001]}>
          <ringGeometry
            args={[
              Math.min(width, height) / 2.5,
              Math.min(width, height) / 2.4,
              64,
            ]}
          />
          <meshBasicMaterial
            color="#4A90D9"
            transparent
            opacity={0.15}
            depthWrite={false}
          />
        </mesh>
      </animated.group>
    </>
  )
}
