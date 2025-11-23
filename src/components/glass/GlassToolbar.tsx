import { useRef, useState, useMemo } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'
// Material created inline

interface GlassToolbarProps {
  width?: number
  height?: number
  thickness?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  collapsed?: boolean
  reducedTransparency?: boolean
  reducedMotion?: boolean
  children?: React.ReactNode
}

export default function GlassToolbar({
  width = 2.5,
  height = 0.1,
  thickness = 0.015,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  collapsed = false,
  reducedTransparency = false,
  reducedMotion = false,
  children,
}: GlassToolbarProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [lastInteraction, setLastInteraction] = useState(Date.now())
  const [faded, setFaded] = useState(false)

  // Create material - slightly more opaque than cards
  const material = useMemo(() => {
    if (reducedTransparency) {
      return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0.15, 0.15, 0.2),
        transparent: true,
        opacity: 0.92,
        roughness: 0.5,
        metalness: 0,
        side: THREE.DoubleSide,
      })
    }

    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(1, 1, 1),
      transparent: true,
      transmission: 0.85,
      roughness: 0.2,
      thickness: thickness,
      ior: 1.45,
      metalness: 0,
      envMapIntensity: 1.0,
      clearcoat: 0.08,
      clearcoatRoughness: 0.15,
      side: THREE.DoubleSide,
    })
  }, [thickness, reducedTransparency])

  // Animation springs for collapse/expand and fade
  const { animatedHeight } = useSpring({
    animatedHeight: collapsed ? 0.04 : height,
    config: reducedMotion
      ? { duration: 0 }
      : { tension: 200, friction: 20 },
  })

  // Auto-fade after inactivity
  useFrame(() => {
    if (reducedMotion) return
    const timeSinceInteraction = Date.now() - lastInteraction
    if (timeSinceInteraction > 5000 && !faded) {
      setFaded(true)
    } else if (timeSinceInteraction < 5000 && faded) {
      setFaded(false)
    }
  })

  // Event handlers
  const handlePointerEnter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(true)
    setLastInteraction(Date.now())
  }

  const handlePointerLeave = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(false)
  }

  const handlePointerMove = () => {
    setLastInteraction(Date.now())
  }

  return (
    <animated.group
      position={position}
      rotation={rotation}
      scale-y={animatedHeight.to((h) => h / height)}
    >
      {/* Toolbar background with slight curve */}
      <RoundedBox
        ref={meshRef}
        args={[width, height, thickness]}
        radius={0.02}
        smoothness={4}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerMove={handlePointerMove}
        material={material}
      >
        {/* Apply opacity via material-opacity rather than animated material */}
      </RoundedBox>

      {/* Subtle top edge highlight */}
      <mesh position={[0, height / 2 - 0.002, thickness / 2 + 0.001]}>
        <planeGeometry args={[width - 0.04, 0.003]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={hovered ? 0.3 : 0.15}
          depthWrite={false}
        />
      </mesh>

      {/* Children (buttons, nav items, etc.) */}
      <group position={[0, 0, thickness / 2 + 0.01]}>{children}</group>
    </animated.group>
  )
}
