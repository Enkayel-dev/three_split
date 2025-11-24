/**
 * Renders dynamic objects created via MCP
 */

import { useMemo } from 'react'
import { Text } from '@react-three/drei'
import { GlassPanel, GlassCard, GlassButton } from '@/components/glass'
import { createLiquidGlassMaterial, LiquidGlassPresets } from '@/materials/LiquidGlassMaterial'
import type { SceneObject } from './types'

interface DynamicObjectProps {
  object: SceneObject
  reducedMotion: boolean
  reducedTransparency: boolean
}

export default function DynamicObject({
  object,
  reducedMotion,
  reducedTransparency,
}: DynamicObjectProps) {
  const { id, type, position, rotation, scale, properties, visible, material } = object

  // Create material based on object's material settings
  const objectMaterial = useMemo(() => {
    if (material?.preset) {
      switch (material.preset) {
        case 'frosted':
          return LiquidGlassPresets.frosted()
        case 'clear':
          return LiquidGlassPresets.clear()
        case 'tinted':
          return LiquidGlassPresets.tinted(material.color || '#4A90D9')
        case 'highContrast':
          return LiquidGlassPresets.highContrast()
        default:
          return LiquidGlassPresets.standard()
      }
    }

    return createLiquidGlassMaterial({
      transmission: material?.transmission ?? 0.92,
      roughness: material?.roughness ?? 0.12,
      tint: material?.color,
      reducedTransparency,
    })
  }, [material, reducedTransparency])

  if (!visible) return null

  // Render based on type
  switch (type) {
    case 'GlassPanel':
      return (
        <GlassPanel
          key={id}
          position={position}
          rotation={rotation}
          width={properties.width as number ?? 0.8}
          height={properties.height as number ?? 0.5}
          thickness={properties.thickness as number ?? 0.03}
          reducedMotion={reducedMotion}
          reducedTransparency={reducedTransparency}
        />
      )

    case 'GlassCard':
      return (
        <group key={id} scale={scale}>
          <GlassCard
            position={position}
            rotation={rotation}
            width={properties.width as number ?? 0.8}
            height={properties.height as number ?? 0.5}
            title={properties.title as string ?? 'Untitled'}
            subtitle={properties.subtitle as string}
            reducedMotion={reducedMotion}
            reducedTransparency={reducedTransparency}
          />
        </group>
      )

    case 'GlassButton':
      return (
        <group key={id} scale={scale}>
          <GlassButton
            position={position}
            rotation={rotation}
            label={properties.label as string ?? 'Button'}
            variant={properties.variant as 'primary' | 'secondary' | 'ghost' ?? 'primary'}
            size={properties.size as 'sm' | 'md' | 'lg' ?? 'md'}
            reducedMotion={reducedMotion}
            reducedTransparency={reducedTransparency}
          />
        </group>
      )

    case 'Box':
      return (
        <mesh key={id} position={position} rotation={rotation} scale={scale}>
          <boxGeometry args={[
            properties.width as number ?? 1,
            properties.height as number ?? 1,
            properties.depth as number ?? 1,
          ]} />
          <primitive object={objectMaterial} attach="material" />
        </mesh>
      )

    case 'Sphere':
      return (
        <mesh key={id} position={position} rotation={rotation} scale={scale}>
          <sphereGeometry args={[
            properties.radius as number ?? 0.5,
            32,
            32,
          ]} />
          <primitive object={objectMaterial} attach="material" />
        </mesh>
      )

    case 'Cylinder':
      return (
        <mesh key={id} position={position} rotation={rotation} scale={scale}>
          <cylinderGeometry args={[
            properties.radiusTop as number ?? 0.5,
            properties.radiusBottom as number ?? 0.5,
            properties.height as number ?? 1,
            32,
          ]} />
          <primitive object={objectMaterial} attach="material" />
        </mesh>
      )

    case 'Text3D':
      return (
        <Text
          key={id}
          position={position}
          rotation={rotation}
          scale={scale}
          fontSize={properties.fontSize as number ?? 0.1}
          color={properties.color as string ?? '#ffffff'}
          anchorX="center"
          anchorY="middle"
          maxWidth={properties.maxWidth as number}
        >
          {properties.text as string ?? 'Text'}
        </Text>
      )

    default:
      // Unknown type - render as wireframe box placeholder
      return (
        <mesh key={id} position={position} rotation={rotation} scale={scale}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshBasicMaterial color="#ff00ff" wireframe />
        </mesh>
      )
  }
}

// Render all dynamic objects for a specific node
interface DynamicObjectsProps {
  objects: SceneObject[]
  currentNode: string
  reducedMotion: boolean
  reducedTransparency: boolean
}

export function DynamicObjects({
  objects,
  currentNode,
  reducedMotion,
  reducedTransparency,
}: DynamicObjectsProps) {
  // Filter objects for current node
  const nodeObjects = objects.filter(
    (obj) => obj.parentNode === currentNode || obj.parentNode === 'global'
  )

  return (
    <group name="mcp-dynamic-objects">
      {nodeObjects.map((obj) => (
        <DynamicObject
          key={obj.id}
          object={obj}
          reducedMotion={reducedMotion}
          reducedTransparency={reducedTransparency}
        />
      ))}
    </group>
  )
}
