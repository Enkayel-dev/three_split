import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import GlassPanel from '@/components/glass/GlassPanel'
import GlassCard from '@/components/glass/GlassCard'
import { useNavigationStore } from '@/store'
import type { NodeId } from '@/store'

interface HomeHubProps {
  reducedMotion: boolean
  reducedTransparency: boolean
}

export default function HomeHub({ reducedMotion, reducedTransparency }: HomeHubProps) {
  const { navigateTo } = useNavigationStore()
  const heroRef = useRef<THREE.Group>(null)

  // Subtle floating animation for hero card
  useFrame((state) => {
    if (reducedMotion || !heroRef.current) return
    const t = state.clock.elapsedTime
    heroRef.current.position.y = 1.2 + Math.sin(t * 0.5) * 0.02
  })

  const handleNavigation = (target: NodeId) => {
    navigateTo(target)
  }

  return (
    <group>
      {/* Hero Card */}
      <group ref={heroRef} position={[0, 1.2, 0]}>
        <GlassPanel
          width={2.0}
          height={1.2}
          thickness={0.04}
          reducedTransparency={reducedTransparency}
          onClick={() => handleNavigation('consulting')}
        >
          {/* Content will be rendered via HTML overlay or SDF text */}
        </GlassPanel>
      </group>

      {/* Navigation Card: Consulting */}
      <GlassCard
        position={[-1.5, 0.8, -1.2]}
        rotation={[0, 0.2, 0]}
        title="Consulting"
        subtitle="Streamline operations"
        reducedMotion={reducedMotion}
        reducedTransparency={reducedTransparency}
        onClick={() => handleNavigation('consulting')}
      />

      {/* Navigation Card: Software */}
      <GlassCard
        position={[0, 0.8, -1.2]}
        rotation={[0, 0, 0]}
        title="Software"
        subtitle="Build custom tools"
        reducedMotion={reducedMotion}
        reducedTransparency={reducedTransparency}
        onClick={() => handleNavigation('software')}
      />

      {/* Navigation Card: Construction */}
      <GlassCard
        position={[1.5, 0.8, -1.2]}
        rotation={[0, -0.2, 0]}
        title="Construction"
        subtitle="Design spaces"
        reducedMotion={reducedMotion}
        reducedTransparency={reducedTransparency}
        onClick={() => handleNavigation('construction')}
      />

      {/* Floating Logo/Accent */}
      <FloatingLogo position={[0, 2, -0.5]} reducedMotion={reducedMotion} />
    </group>
  )
}

// Floating logo component
interface FloatingLogoProps {
  position: [number, number, number]
  reducedMotion: boolean
}

function FloatingLogo({ position, reducedMotion }: FloatingLogoProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (reducedMotion || !meshRef.current) return
    const t = state.clock.elapsedTime
    meshRef.current.rotation.y = t * 0.1
  })

  return (
    <mesh ref={meshRef} position={position}>
      <icosahedronGeometry args={[0.15, 0]} />
      <meshStandardMaterial
        color="#4A90D9"
        emissive="#4A90D9"
        emissiveIntensity={0.3}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  )
}
