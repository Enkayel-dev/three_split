import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { useNavigationStore } from '@/store'
import HomeHub from './HomeHub'
import CameraController from '@/systems/camera/CameraController'

interface SceneProps {
  reducedMotion: boolean
  reducedTransparency: boolean
}

export default function Scene({ reducedMotion, reducedTransparency }: SceneProps) {
  const { currentNode } = useNavigationStore()
  const groupRef = useRef<THREE.Group>(null)

  // Subtle ambient rotation for living feel (disabled in reduced motion)
  useFrame((state) => {
    if (reducedMotion || !groupRef.current) return
    const t = state.clock.elapsedTime
    groupRef.current.rotation.y = Math.sin(t * 0.05) * 0.01
  })

  return (
    <>
      {/* Environment & Lighting */}
      <Environment preset="studio" background={false} />
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.5}
        castShadow
        shadow-mapSize={1024}
      />

      {/* Fog for depth */}
      <fog attach="fog" args={['#0a0a0f', 5, 20]} />

      {/* Background color */}
      <color attach="background" args={['#0a0a0f']} />

      {/* Camera Controller */}
      <CameraController reducedMotion={reducedMotion} />

      {/* Scene content */}
      <group ref={groupRef}>
        {/* Contact shadows for grounding */}
        <ContactShadows
          position={[0, -0.5, 0]}
          opacity={0.4}
          scale={10}
          blur={2}
          far={4}
        />

        {/* Render current scene based on navigation */}
        {currentNode === 'home' && (
          <HomeHub
            reducedMotion={reducedMotion}
            reducedTransparency={reducedTransparency}
          />
        )}

        {/* Placeholder for other scenes - will be implemented */}
        {currentNode === 'consulting' && (
          <group position={[0, 1, 0]}>
            {/* ConsultingRoom placeholder */}
          </group>
        )}

        {currentNode === 'software' && (
          <group position={[0, 1, 0]}>
            {/* SoftwareRoom placeholder */}
          </group>
        )}

        {currentNode === 'construction' && (
          <group position={[0, 1, 0]}>
            {/* ConstructionRoom placeholder */}
          </group>
        )}

        {currentNode === 'contact' && (
          <group position={[0, 1, 0]}>
            {/* ContactNode placeholder */}
          </group>
        )}
      </group>
    </>
  )
}
