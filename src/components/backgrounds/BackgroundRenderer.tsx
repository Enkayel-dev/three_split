/**
 * BackgroundRenderer Component
 *
 * Renders scene backgrounds based on definition (color, gradient, sphere, hemisphere).
 */

import { Stars, Grid } from '@react-three/drei'
import type { BackgroundDefinition } from '@/types/sceneDefinition'

interface BackgroundRendererProps {
  background: BackgroundDefinition
}

export function BackgroundRenderer({ background }: BackgroundRendererProps) {
  return (
    <>
      {/* Background Color */}
      {background.type === 'color' && background.color && (
        <color attach="background" args={[background.color]} />
      )}

      {/* Stars */}
      {background.stars && background.stars.enabled && (
        <Stars
          radius={background.stars.radius}
          depth={background.stars.depth || 50}
          count={background.stars.count}
          factor={4}
          saturation={background.stars.saturation ?? 0}
          fade={background.stars.fade ?? false}
          speed={background.stars.speed ?? 1}
        />
      )}

      {/* Grid */}
      {background.grid && background.grid.enabled && (
        <Grid
          position={background.grid.position || [0, -0.5, 0]}
          args={[20, 20]}
          cellSize={background.grid.cellSize}
          cellThickness={background.grid.cellThickness || 0.5}
          cellColor={background.grid.cellColor || '#1a1a2e'}
          sectionSize={background.grid.sectionSize || 2}
          sectionThickness={background.grid.sectionThickness || 1}
          sectionColor={background.grid.sectionColor || '#2a2a4e'}
          fadeDistance={background.grid.fadeDistance}
          fadeStrength={background.grid.fadeStrength ?? 1}
          followCamera={background.grid.followCamera ?? false}
          infiniteGrid={background.grid.infiniteGrid ?? true}
        />
      )}

      {/* TODO: Gradient backgrounds - will be implemented in Phase 7 */}
      {background.type === 'gradient' && (
        <>
          {/* Fallback to color for now */}
          {background.gradient && background.gradient.colors[0] && (
            <color attach="background" args={[background.gradient.colors[0]]} />
          )}
        </>
      )}

      {/* TODO: Sphere/Hemisphere backgrounds - will be implemented in Phase 7 */}
      {(background.type === 'sphere' || background.type === 'hemisphere') && (
        <>
          {/* Fallback to color for now */}
          <color attach="background" args={['#0a0a12']} />
        </>
      )}
    </>
  )
}
