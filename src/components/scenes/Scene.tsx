import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, ContactShadows, Stars, Grid } from '@react-three/drei'
import * as THREE from 'three'
import { useNavigationStore, useSceneObjectsStore } from '@/store'
import HomeHub from './HomeHub'
import ConsultingRoom from './ConsultingRoom'
import SoftwareRoom from './SoftwareRoom'
import ConstructionRoom from './ConstructionRoom'
import ContactNode from './ContactNode'
import CameraController from '@/systems/camera/CameraController'
import { DynamicObjects } from '@/mcp'
import { SceneLoader } from '@/systems/scene-loader/SceneLoader'

interface SceneProps {
  reducedMotion: boolean
  reducedTransparency: boolean
}

// Feature flag for dynamic scenes (Phase 2+)
// Set to 'true' to use JSON-based dynamic scenes
// Set to 'false' to use legacy static JSX scenes
const USE_DYNAMIC_SCENES = import.meta.env.VITE_USE_DYNAMIC_SCENES === 'true'

export default function Scene({ reducedMotion, reducedTransparency }: SceneProps) {
  const { currentNode } = useNavigationStore()
  const { sceneObjects } = useSceneObjectsStore()
  const groupRef = useRef<THREE.Group>(null)

  // Subtle ambient rotation for living feel (disabled in reduced motion)
  useFrame((state) => {
    if (reducedMotion || !groupRef.current) return
    const t = state.clock.elapsedTime
    groupRef.current.rotation.y = Math.sin(t * 0.05) * 0.01
  })

  // Dynamic scene loader (Phase 2+)
  if (USE_DYNAMIC_SCENES) {
    return (
      <>
        {/* Camera Controller */}
        <CameraController reducedMotion={reducedMotion} />

        {/* Load scene from JSON */}
        <SceneLoader
          sceneId={currentNode}
          reducedMotion={reducedMotion}
          reducedTransparency={reducedTransparency}
        />

        {/* MCP Dynamic Objects (still supported in dynamic mode) */}
        <DynamicObjects
          objects={sceneObjects}
          currentNode={currentNode}
          reducedMotion={reducedMotion}
          reducedTransparency={reducedTransparency}
        />
      </>
    )
  }

  // Legacy static scenes (Phase 1)
  return (
    <>
      {/* Environment & Lighting */}
      <Environment preset="city" background={false} />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={1024}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#4A90D9" />

      {/* Background color */}
      <color attach="background" args={['#0a0a12']} />

      {/* Subtle stars in background */}
      <Stars
        radius={50}
        depth={50}
        count={1000}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />

      {/* Grid floor for spatial reference */}
      <Grid
        position={[0, -0.5, 0]}
        args={[20, 20]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#1a1a2e"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#2a2a4e"
        fadeDistance={15}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
      />

      {/* Camera Controller */}
      <CameraController reducedMotion={reducedMotion} />

      {/* Scene content */}
      <group ref={groupRef}>
        {/* Contact shadows for grounding */}
        <ContactShadows
          position={[0, -0.49, 0]}
          opacity={0.5}
          scale={15}
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

        {/* Consulting Room */}
        {currentNode === 'consulting' && (
          <ConsultingRoom
            reducedMotion={reducedMotion}
            reducedTransparency={reducedTransparency}
          />
        )}

        {/* Software Room */}
        {currentNode === 'software' && (
          <SoftwareRoom
            reducedMotion={reducedMotion}
            reducedTransparency={reducedTransparency}
          />
        )}

        {/* Construction Room */}
        {currentNode === 'construction' && (
          <ConstructionRoom
            reducedMotion={reducedMotion}
            reducedTransparency={reducedTransparency}
          />
        )}

        {/* Contact Node */}
        {currentNode === 'contact' && (
          <ContactNode
            reducedMotion={reducedMotion}
            reducedTransparency={reducedTransparency}
          />
        )}

        {/* MCP Dynamic Objects */}
        <DynamicObjects
          objects={sceneObjects}
          currentNode={currentNode}
          reducedMotion={reducedMotion}
          reducedTransparency={reducedTransparency}
        />
      </group>
    </>
  )
}
