/**
 * Liquid Glass Animation Primitives
 * Reusable animation effects for glass components
 */

import * as THREE from 'three'

export interface AnimationConfig {
  duration?: number
  easing?: (t: number) => number
  reducedMotion?: boolean
}

// Easing functions
export const easings = {
  linear: (t: number) => t,
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
  easeIn: (t: number) => t * t * t,
  bounce: (t: number) => {
    const n1 = 7.5625
    const d1 = 2.75
    if (t < 1 / d1) return n1 * t * t
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375
    return n1 * (t -= 2.625 / d1) * t + 0.984375
  },
  elastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
  },
}

/**
 * Ripple effect parameters
 */
export interface RippleParams {
  origin: [number, number] // UV coordinates (0-1)
  color?: THREE.Color | string
  maxRadius?: number
  duration?: number
  thickness?: number
}

/**
 * Creates a ripple animation shader uniform updates
 */
export function createRippleAnimation(params: RippleParams): {
  uniforms: Record<string, THREE.IUniform>
  update: (time: number, startTime: number) => boolean
} {
  const { origin, color = '#ffffff', maxRadius = 2, duration = 600, thickness = 0.1 } = params

  const uniforms = {
    uRippleOrigin: { value: new THREE.Vector2(origin[0], origin[1]) },
    uRippleRadius: { value: 0 },
    uRippleColor: { value: typeof color === 'string' ? new THREE.Color(color) : color },
    uRippleThickness: { value: thickness },
    uRippleAlpha: { value: 0 },
  }

  const update = (time: number, startTime: number): boolean => {
    const elapsed = time - startTime
    const progress = Math.min(elapsed / duration, 1)

    uniforms.uRippleRadius.value = progress * maxRadius
    uniforms.uRippleAlpha.value = 1 - easings.easeOut(progress)

    return progress < 1
  }

  return { uniforms, update }
}

/**
 * Glow pulse animation state
 */
export interface GlowPulseState {
  intensity: number
  baseIntensity: number
  maxIntensity: number
  speed: number
  active: boolean
}

export function createGlowPulse(
  baseIntensity = 0.15,
  maxIntensity = 0.35,
  speed = 2
): GlowPulseState {
  return {
    intensity: baseIntensity,
    baseIntensity,
    maxIntensity,
    speed,
    active: true,
  }
}

export function updateGlowPulse(
  state: GlowPulseState,
  time: number,
  reducedMotion = false
): number {
  if (reducedMotion || !state.active) {
    return state.baseIntensity
  }

  const amplitude = (state.maxIntensity - state.baseIntensity) / 2
  const offset = state.baseIntensity + amplitude
  state.intensity = offset + Math.sin(time * state.speed) * amplitude

  return state.intensity
}

/**
 * Liquid deformation for hover effect
 */
export interface LiquidDeformState {
  deformation: THREE.Vector3
  targetDeformation: THREE.Vector3
  velocity: THREE.Vector3
  stiffness: number
  damping: number
}

export function createLiquidDeform(stiffness = 150, damping = 12): LiquidDeformState {
  return {
    deformation: new THREE.Vector3(0, 0, 0),
    targetDeformation: new THREE.Vector3(0, 0, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    stiffness,
    damping,
  }
}

export function updateLiquidDeform(
  state: LiquidDeformState,
  delta: number,
  reducedMotion = false
): THREE.Vector3 {
  if (reducedMotion) {
    state.deformation.copy(state.targetDeformation)
    return state.deformation
  }

  // Spring physics
  const dx = state.targetDeformation.x - state.deformation.x
  const dy = state.targetDeformation.y - state.deformation.y
  const dz = state.targetDeformation.z - state.deformation.z

  state.velocity.x += dx * state.stiffness * delta
  state.velocity.y += dy * state.stiffness * delta
  state.velocity.z += dz * state.stiffness * delta

  state.velocity.multiplyScalar(Math.max(0, 1 - state.damping * delta))

  state.deformation.add(state.velocity.clone().multiplyScalar(delta))

  return state.deformation
}

export function setLiquidDeformTarget(
  state: LiquidDeformState,
  target: [number, number, number]
): void {
  state.targetDeformation.set(target[0], target[1], target[2])
}

/**
 * Fresnel shift animation for edge glow
 */
export interface FresnelShiftState {
  power: number
  basePower: number
  targetPower: number
  intensity: number
  baseIntensity: number
  targetIntensity: number
  transitionSpeed: number
}

export function createFresnelShift(
  basePower = 2.5,
  baseIntensity = 0.1
): FresnelShiftState {
  return {
    power: basePower,
    basePower,
    targetPower: basePower,
    intensity: baseIntensity,
    baseIntensity,
    targetIntensity: baseIntensity,
    transitionSpeed: 8,
  }
}

export function updateFresnelShift(
  state: FresnelShiftState,
  delta: number,
  reducedMotion = false
): { power: number; intensity: number } {
  if (reducedMotion) {
    state.power = state.targetPower
    state.intensity = state.targetIntensity
  } else {
    const speed = state.transitionSpeed * delta
    state.power = THREE.MathUtils.lerp(state.power, state.targetPower, speed)
    state.intensity = THREE.MathUtils.lerp(state.intensity, state.targetIntensity, speed)
  }

  return { power: state.power, intensity: state.intensity }
}

export function setFresnelShiftHovered(state: FresnelShiftState, hovered: boolean): void {
  if (hovered) {
    state.targetPower = state.basePower * 0.7 // Lower power = more edge glow
    state.targetIntensity = state.baseIntensity * 2.5
  } else {
    state.targetPower = state.basePower
    state.targetIntensity = state.baseIntensity
  }
}

/**
 * Refraction wave animation for click feedback
 */
export interface RefractionWaveState {
  iorOffset: number
  targetIorOffset: number
  waveProgress: number
  isActive: boolean
  duration: number
}

export function createRefractionWave(duration = 400): RefractionWaveState {
  return {
    iorOffset: 0,
    targetIorOffset: 0,
    waveProgress: 0,
    isActive: false,
    duration,
  }
}

export function triggerRefractionWave(state: RefractionWaveState): void {
  state.isActive = true
  state.waveProgress = 0
  state.targetIorOffset = 0.15
}

export function updateRefractionWave(
  state: RefractionWaveState,
  delta: number,
  reducedMotion = false
): number {
  if (!state.isActive || reducedMotion) {
    state.iorOffset = 0
    return 0
  }

  state.waveProgress += (delta * 1000) / state.duration

  if (state.waveProgress >= 1) {
    state.isActive = false
    state.iorOffset = 0
    state.waveProgress = 0
    return 0
  }

  // Wave shape: quick rise, slow fall
  const progress = state.waveProgress
  const wave = progress < 0.2
    ? easings.easeOut(progress / 0.2)
    : 1 - easings.easeIn((progress - 0.2) / 0.8)

  state.iorOffset = state.targetIorOffset * wave

  return state.iorOffset
}

/**
 * Combined animation state for a glass object
 */
export interface GlassAnimationState {
  glowPulse: GlowPulseState
  liquidDeform: LiquidDeformState
  fresnelShift: FresnelShiftState
  refractionWave: RefractionWaveState
  ripples: Array<{
    params: RippleParams
    startTime: number
    update: (time: number, startTime: number) => boolean
  }>
}

export function createGlassAnimationState(): GlassAnimationState {
  return {
    glowPulse: createGlowPulse(),
    liquidDeform: createLiquidDeform(),
    fresnelShift: createFresnelShift(),
    refractionWave: createRefractionWave(),
    ripples: [],
  }
}

export function addRipple(
  state: GlassAnimationState,
  params: RippleParams,
  currentTime: number
): void {
  const ripple = createRippleAnimation(params)
  state.ripples.push({
    params,
    startTime: currentTime,
    update: ripple.update,
  })

  // Limit number of concurrent ripples
  if (state.ripples.length > 3) {
    state.ripples.shift()
  }
}

/**
 * Animation trigger handler type
 */
export type AnimationTriggerHandler = (
  animation: string,
  params?: Record<string, unknown>
) => void

/**
 * Create animation trigger handler for a component
 */
export function createAnimationHandler(
  state: GlassAnimationState,
  getCurrentTime: () => number
): AnimationTriggerHandler {
  return (animation: string, params?: Record<string, unknown>) => {
    switch (animation) {
      case 'pulse':
        state.glowPulse.active = true
        break
      case 'stopPulse':
        state.glowPulse.active = false
        break
      case 'ripple':
        addRipple(
          state,
          {
            origin: (params?.origin as [number, number]) || [0.5, 0.5],
            color: params?.color as string,
            duration: params?.duration as number,
          },
          getCurrentTime()
        )
        break
      case 'glow':
        state.glowPulse.maxIntensity = (params?.intensity as number) || 0.5
        state.glowPulse.active = true
        break
      case 'liquidDeform':
        setLiquidDeformTarget(
          state.liquidDeform,
          (params?.target as [number, number, number]) || [0, 0, 0]
        )
        break
      case 'fresnelShift':
        setFresnelShiftHovered(state.fresnelShift, params?.hovered as boolean ?? true)
        break
      case 'refractionWave':
        triggerRefractionWave(state.refractionWave)
        break
      case 'shake':
        // Quick shake animation
        const shakeIntensity = (params?.intensity as number) || 0.02
        setLiquidDeformTarget(state.liquidDeform, [shakeIntensity, 0, 0])
        setTimeout(() => setLiquidDeformTarget(state.liquidDeform, [-shakeIntensity, 0, 0]), 50)
        setTimeout(() => setLiquidDeformTarget(state.liquidDeform, [0, 0, 0]), 100)
        break
      case 'fadeIn':
      case 'fadeOut':
        // These would typically be handled by opacity animations
        break
    }
  }
}
