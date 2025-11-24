/**
 * Hook for managing ripple effects on glass components
 */

import { useRef, useCallback, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Ripple {
  id: number
  origin: THREE.Vector2
  startTime: number
  duration: number
  maxRadius: number
  color: THREE.Color
  thickness: number
}

interface UseRippleEffectProps {
  maxRipples?: number
  defaultDuration?: number
  defaultMaxRadius?: number
  defaultColor?: string
  defaultThickness?: number
  reducedMotion?: boolean
}

interface RippleUniforms {
  uRippleCount: THREE.IUniform<number>
  uRippleOrigins: THREE.IUniform<THREE.Vector2[]>
  uRippleProgress: THREE.IUniform<number[]>
  uRippleColors: THREE.IUniform<THREE.Color[]>
  uRippleThickness: THREE.IUniform<number[]>
}

export function useRippleEffect({
  maxRipples = 3,
  defaultDuration = 600,
  defaultMaxRadius = 2,
  defaultColor = '#4A90D9',
  defaultThickness = 0.08,
  reducedMotion = false,
}: UseRippleEffectProps = {}) {
  const ripples = useRef<Ripple[]>([])
  const idCounter = useRef(0)

  // Create shader uniforms
  const uniforms = useMemo<RippleUniforms>(() => ({
    uRippleCount: { value: 0 },
    uRippleOrigins: { value: Array(maxRipples).fill(null).map(() => new THREE.Vector2(0.5, 0.5)) },
    uRippleProgress: { value: Array(maxRipples).fill(0) },
    uRippleColors: { value: Array(maxRipples).fill(null).map(() => new THREE.Color(defaultColor)) },
    uRippleThickness: { value: Array(maxRipples).fill(defaultThickness) },
  }), [maxRipples, defaultColor, defaultThickness])

  // Add a new ripple
  const addRipple = useCallback((
    originX: number,
    originY: number,
    options?: {
      duration?: number
      maxRadius?: number
      color?: string
      thickness?: number
    }
  ) => {
    if (reducedMotion) return

    const newRipple: Ripple = {
      id: idCounter.current++,
      origin: new THREE.Vector2(originX, originY),
      startTime: performance.now(),
      duration: options?.duration ?? defaultDuration,
      maxRadius: options?.maxRadius ?? defaultMaxRadius,
      color: new THREE.Color(options?.color ?? defaultColor),
      thickness: options?.thickness ?? defaultThickness,
    }

    ripples.current.push(newRipple)

    // Remove oldest ripple if exceeding max
    if (ripples.current.length > maxRipples) {
      ripples.current.shift()
    }
  }, [defaultDuration, defaultMaxRadius, defaultColor, defaultThickness, maxRipples, reducedMotion])

  // Trigger ripple from click event
  const triggerRipple = useCallback((event: { uv?: THREE.Vector2 }) => {
    if (event.uv) {
      addRipple(event.uv.x, event.uv.y)
    } else {
      // Default to center if no UV
      addRipple(0.5, 0.5)
    }
  }, [addRipple])

  // Update ripples each frame
  useFrame(() => {
    if (reducedMotion) {
      uniforms.uRippleCount.value = 0
      return
    }

    const now = performance.now()

    // Filter out completed ripples
    ripples.current = ripples.current.filter(ripple => {
      const elapsed = now - ripple.startTime
      return elapsed < ripple.duration
    })

    // Update uniforms
    uniforms.uRippleCount.value = ripples.current.length

    ripples.current.forEach((ripple, index) => {
      const elapsed = now - ripple.startTime
      const progress = elapsed / ripple.duration

      uniforms.uRippleOrigins.value[index].copy(ripple.origin)
      uniforms.uRippleProgress.value[index] = progress
      uniforms.uRippleColors.value[index].copy(ripple.color)
      uniforms.uRippleThickness.value[index] = ripple.thickness
    })
  })

  // Get current active ripple data (for non-shader use)
  const getActiveRipples = useCallback(() => {
    const now = performance.now()
    return ripples.current.map(ripple => {
      const elapsed = now - ripple.startTime
      const progress = Math.min(elapsed / ripple.duration, 1)
      return {
        origin: ripple.origin,
        progress,
        radius: progress * ripple.maxRadius,
        alpha: 1 - progress,
        color: ripple.color,
      }
    }).filter(r => r.progress < 1)
  }, [])

  return {
    addRipple,
    triggerRipple,
    uniforms,
    getActiveRipples,
    hasActiveRipples: () => ripples.current.length > 0,
  }
}

/**
 * Ripple shader chunk for material injection
 */
export const rippleShaderChunk = {
  uniforms: `
    uniform int uRippleCount;
    uniform vec2 uRippleOrigins[3];
    uniform float uRippleProgress[3];
    uniform vec3 uRippleColors[3];
    uniform float uRippleThickness[3];
  `,
  fragment: `
    vec3 calculateRippleEffect(vec2 uv, vec3 baseColor) {
      vec3 result = baseColor;

      for (int i = 0; i < 3; i++) {
        if (i >= uRippleCount) break;

        float dist = distance(uv, uRippleOrigins[i]);
        float progress = uRippleProgress[i];
        float radius = progress * 2.0;
        float thickness = uRippleThickness[i];

        float ripple = smoothstep(radius - thickness, radius, dist)
                     - smoothstep(radius, radius + thickness, dist);

        float alpha = (1.0 - progress) * ripple;
        result = mix(result, uRippleColors[i], alpha * 0.3);
      }

      return result;
    }
  `,
}
