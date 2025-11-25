/**
 * ObjectFactory Component
 *
 * Creates 3D objects from scene definitions.
 * Supports GlassButton, GlassCard, GlassPanel, mesh, and group types.
 */

import { useCallback, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import GlassButton from '@/components/glass/GlassButton'
import GlassCard from '@/components/glass/GlassCard'
import GlassPanel from '@/components/glass/GlassPanel'
import { useNavigationStore } from '@/store'
import type { SceneObjectDefinition, GeometryType } from '@/types/sceneDefinition'

interface ObjectFactoryProps {
  definition: SceneObjectDefinition
  reducedMotion: boolean
  reducedTransparency: boolean
}

export function ObjectFactory({
  definition,
  reducedMotion,
  reducedTransparency,
}: ObjectFactoryProps) {
  const { navigateTo } = useNavigationStore()
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  // Handle click interactions
  const handleClick = useCallback(() => {
    if (!definition.interactions?.onClick) return

    const { type, target, animation } = definition.interactions.onClick

    if (type === 'navigate' && target) {
      navigateTo(target as any)
    } else if (type === 'animate' && animation) {
      // TODO: Trigger animation - will be implemented in Phase 8
      console.log(`Trigger animation: ${animation}`)
    }
  }, [definition.interactions, navigateTo])

  // Apply ambient animation if enabled
  useFrame((state) => {
    if (reducedMotion) return

    // Floating animation for objects
    if (definition.animations?.enabled && definition.animations.autoPlay?.includes('float')) {
      if (groupRef.current) {
        const t = state.clock.elapsedTime
        const baseY = definition.transform.position[1]
        groupRef.current.position.y = baseY + Math.sin(t * 0.5) * 0.02
      }
    }

    // Rotation animation for objects
    if (definition.animations?.enabled && definition.animations.autoPlay?.includes('rotation')) {
      if (meshRef.current) {
        const t = state.clock.elapsedTime
        meshRef.current.rotation.y = t * 0.1
      }
    }
  })

  const { position, rotation, scale } = definition.transform

  // Map size values from scene definition to component props
  const mapButtonSize = (size?: string): 'sm' | 'md' | 'lg' => {
    if (size === 'small') return 'sm'
    if (size === 'large') return 'lg'
    return 'md'
  }

  // Render based on object type
  switch (definition.type) {
    case 'GlassButton':
      return (
        <GlassButton
          id={definition.id}
          name={definition.name}
          position={position}
          rotation={rotation}
          label={definition.glassProps?.label || 'Button'}
          variant={definition.glassProps?.variant || 'primary'}
          size={mapButtonSize(definition.glassProps?.size)}
          disabled={definition.glassProps?.disabled || false}
          loading={definition.glassProps?.loading || false}
          reducedMotion={reducedMotion}
          reducedTransparency={reducedTransparency}
          onClick={handleClick}
          parentNode="dynamic"
        />
      )

    case 'GlassCard':
      return (
        <GlassCard
          id={definition.id}
          name={definition.name}
          position={position}
          rotation={rotation}
          title={definition.glassProps?.title || ''}
          subtitle={definition.glassProps?.subtitle || ''}
          reducedMotion={reducedMotion}
          reducedTransparency={reducedTransparency}
          onClick={handleClick}
          parentNode="dynamic"
        />
      )

    case 'GlassPanel':
      return (
        <GlassPanel
          id={definition.id}
          name={definition.name}
          position={position}
          rotation={rotation}
          width={definition.glassProps?.width || 1}
          height={definition.glassProps?.height || 1}
          thickness={definition.glassProps?.thickness || 0.05}
          reducedTransparency={reducedTransparency}
          onClick={handleClick}
          parentNode="dynamic"
        />
      )

    case 'mesh':
      if (!definition.geometry) {
        console.error(`Mesh object ${definition.id} has no geometry`)
        return null
      }

      return (
        <mesh
          ref={meshRef}
          position={position}
          rotation={rotation}
          scale={scale}
          visible={definition.visible}
          castShadow={definition.castShadow}
          receiveShadow={definition.receiveShadow}
          renderOrder={definition.renderOrder}
          onClick={handleClick}
        >
          <DynamicGeometry type={definition.geometry.type} args={definition.geometry.args} />
          <DynamicMaterial material={definition.material} />
        </mesh>
      )

    case 'group':
      return (
        <group
          ref={groupRef}
          position={position}
          rotation={rotation}
          scale={scale}
          visible={definition.visible}
        >
          {definition.children?.map((child) => (
            <ObjectFactory
              key={child.id}
              definition={child}
              reducedMotion={reducedMotion}
              reducedTransparency={reducedTransparency}
            />
          ))}
        </group>
      )

    default:
      console.warn(`Unknown object type: ${definition.type}`)
      return null
  }
}

/**
 * Dynamic Geometry Component
 */
interface DynamicGeometryProps {
  type: GeometryType
  args: number[]
}

function DynamicGeometry({ type, args }: DynamicGeometryProps) {
  switch (type) {
    case 'box':
      return <boxGeometry args={args as [number?, number?, number?]} />
    case 'sphere':
      return <sphereGeometry args={args as [number?, number?, number?]} />
    case 'cylinder':
      return <cylinderGeometry args={args as [number?, number?, number?]} />
    case 'plane':
      return <planeGeometry args={args as [number?, number?]} />
    case 'icosahedron':
      return <icosahedronGeometry args={args as [number?, number?]} />
    case 'torus':
      return <torusGeometry args={args as [number?, number?, number?]} />
    case 'cone':
      return <coneGeometry args={args as [number?, number?, number?]} />
    case 'dodecahedron':
      return <dodecahedronGeometry args={args as [number?, number?]} />
    case 'octahedron':
      return <octahedronGeometry args={args as [number?, number?]} />
    case 'tetrahedron':
      return <tetrahedronGeometry args={args as [number?, number?]} />
    case 'torusKnot':
      return <torusKnotGeometry args={args as [number?, number?, number?]} />
    default:
      console.warn(`Unknown geometry type: ${type}`)
      return <boxGeometry />
  }
}

/**
 * Dynamic Material Component
 */
interface DynamicMaterialProps {
  material?: SceneObjectDefinition['material']
}

function DynamicMaterial({ material }: DynamicMaterialProps) {
  if (!material) {
    return <meshStandardMaterial />
  }

  const materialType = material.type || 'MeshStandardMaterial'

  // Common props
  const commonProps = {
    color: material.color,
    opacity: material.opacity,
    transparent: material.transparent,
    side: material.side === 'double' ? THREE.DoubleSide : material.side === 'back' ? THREE.BackSide : THREE.FrontSide,
    wireframe: material.wireframe,
    fog: material.fog,
  }

  switch (materialType) {
    case 'MeshPhysicalMaterial':
      return (
        <meshPhysicalMaterial
          {...commonProps}
          transmission={material.transmission}
          roughness={material.roughness}
          metalness={material.metalness}
          ior={material.ior}
          thickness={material.thickness}
          emissive={material.emissive}
          emissiveIntensity={material.emissiveIntensity}
          clearcoat={material.clearcoat}
          clearcoatRoughness={material.clearcoatRoughness}
          envMapIntensity={material.envMapIntensity}
          attenuationColor={material.attenuationColor}
          attenuationDistance={material.attenuationDistance}
        />
      )

    case 'MeshStandardMaterial':
      return (
        <meshStandardMaterial
          {...commonProps}
          roughness={material.roughness}
          metalness={material.metalness}
          emissive={material.emissive}
          emissiveIntensity={material.emissiveIntensity}
          envMapIntensity={material.envMapIntensity}
        />
      )

    case 'MeshBasicMaterial':
      return <meshBasicMaterial {...commonProps} />

    case 'MeshLambertMaterial':
      return (
        <meshLambertMaterial
          {...commonProps}
          emissive={material.emissive}
          emissiveIntensity={material.emissiveIntensity}
        />
      )

    case 'MeshPhongMaterial':
      return (
        <meshPhongMaterial
          {...commonProps}
          emissive={material.emissive}
          emissiveIntensity={material.emissiveIntensity}
          shininess={30}
        />
      )

    default:
      return <meshStandardMaterial {...commonProps} />
  }
}
