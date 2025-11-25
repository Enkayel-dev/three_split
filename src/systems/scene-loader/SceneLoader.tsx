/**
 * SceneLoader Component
 *
 * Main component for loading and rendering scenes from JSON definitions.
 * Handles loading, error states, and orchestrates all scene elements.
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { useSceneDefinition } from './useSceneDefinition'
import { ObjectFactory } from './ObjectFactory'
import { BackgroundRenderer } from '@/components/backgrounds/BackgroundRenderer'

interface SceneLoaderProps {
  sceneId: string
  reducedMotion: boolean
  reducedTransparency: boolean
}

export function SceneLoader({
  sceneId,
  reducedMotion,
  reducedTransparency,
}: SceneLoaderProps) {
  const { definition, loading, error, validationErrors } = useSceneDefinition(sceneId)
  const groupRef = useRef<THREE.Group>(null)

  // Apply ambient scene animation
  useFrame((state) => {
    if (!definition || reducedMotion || !groupRef.current) return
    if (!definition.animations?.ambient?.enabled) return

    const t = state.clock.elapsedTime
    const { type, params } = definition.animations.ambient

    if (type === 'rotation') {
      const speed = (params.speed as number) || 0.05
      const amplitude = (params.amplitude as number) || 0.01
      groupRef.current.rotation.y = Math.sin(t * speed) * amplitude
    }
  })

  // Handle loading state
  if (loading) {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshBasicMaterial color="#4A90D9" wireframe />
        </mesh>
      </group>
    )
  }

  // Handle error state
  if (error) {
    console.error('Scene loading error:', error)
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#ff0000" wireframe />
        </mesh>
      </group>
    )
  }

  // Handle validation errors
  if (validationErrors.length > 0) {
    console.error('Scene validation errors:', validationErrors)
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#ff8800" wireframe />
        </mesh>
      </group>
    )
  }

  // Handle no definition
  if (!definition) {
    return null
  }

  return (
    <>
      {/* Background */}
      <BackgroundRenderer background={definition.background} />

      {/* Environment */}
      {definition.environment.preset && (
        <Environment
          preset={definition.environment.preset as any}
          background={definition.environment.background ?? false}
          blur={definition.environment.blur}
        />
      )}

      {/* Ambient Light */}
      {definition.lighting.ambient && (
        <ambientLight
          intensity={definition.lighting.ambient.intensity}
          color={definition.lighting.ambient.color}
        />
      )}

      {/* Directional Lights */}
      {definition.lighting.directional?.map((light, index) => (
        <directionalLight
          key={`dir-${index}`}
          position={light.position}
          intensity={light.intensity}
          color={light.color}
          castShadow={light.castShadow}
          shadow-mapSize={light.shadowMapSize ? [light.shadowMapSize, light.shadowMapSize] : undefined}
        />
      ))}

      {/* Point Lights */}
      {definition.lighting.point?.map((light, index) => (
        <pointLight
          key={`point-${index}`}
          position={light.position}
          intensity={light.intensity}
          color={light.color}
          distance={light.distance}
          decay={light.decay}
        />
      ))}

      {/* Spot Lights */}
      {definition.lighting.spot?.map((light, index) => (
        <spotLight
          key={`spot-${index}`}
          position={light.position}
          target-position={light.target}
          intensity={light.intensity}
          color={light.color}
          angle={light.angle}
          penumbra={light.penumbra}
          distance={light.distance}
          decay={light.decay}
          castShadow={light.castShadow}
        />
      ))}

      {/* Scene Objects */}
      <group ref={groupRef}>
        {/* Contact Shadows */}
        <ContactShadows
          position={[0, -0.49, 0]}
          opacity={0.5}
          scale={15}
          blur={2}
          far={4}
        />

        {/* Render all scene objects */}
        {definition.objects.map((obj) => (
          <ObjectFactory
            key={obj.id}
            definition={obj}
            reducedMotion={reducedMotion}
            reducedTransparency={reducedTransparency}
          />
        ))}
      </group>
    </>
  )
}
