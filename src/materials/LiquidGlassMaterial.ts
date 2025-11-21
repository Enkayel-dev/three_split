import * as THREE from 'three'

/**
 * Liquid Glass Material Parameters
 * Based on Apple's Liquid Glass design aesthetic
 */
export interface LiquidGlassParams {
  // Optical properties
  ior?: number // Index of refraction (1.45 for glass)
  transmission?: number // Transparency (0-1)
  roughness?: number // Blur/frost amount (0-1)
  thickness?: number // Glass thickness for attenuation

  // Fresnel properties
  fresnelPower?: number // Edge brightness falloff

  // Color
  tint?: THREE.Color | string
  attenuationColor?: THREE.Color | string
  attenuationDistance?: number

  // Reflections
  envMapIntensity?: number
  clearcoat?: number
  clearcoatRoughness?: number

  // Reduced transparency mode
  reducedTransparency?: boolean
}

const defaultParams: Required<LiquidGlassParams> = {
  ior: 1.45,
  transmission: 0.92,
  roughness: 0.12,
  thickness: 0.03,
  fresnelPower: 2.5,
  tint: new THREE.Color(1, 1, 1),
  attenuationColor: new THREE.Color(0.95, 0.95, 0.97),
  attenuationDistance: 0.5,
  envMapIntensity: 1.2,
  clearcoat: 0.1,
  clearcoatRoughness: 0.1,
  reducedTransparency: false,
}

/**
 * Creates a Liquid Glass material using Three.js MeshPhysicalMaterial
 * This provides a good approximation of the Liquid Glass effect
 * using built-in Three.js features
 */
export function createLiquidGlassMaterial(
  params: LiquidGlassParams = {}
): THREE.MeshPhysicalMaterial {
  const p = { ...defaultParams, ...params }

  // Handle reduced transparency mode
  if (p.reducedTransparency) {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0.9, 0.9, 0.92),
      transparent: true,
      opacity: 0.85,
      roughness: 0.6,
      metalness: 0,
      side: THREE.DoubleSide,
    })
  }

  // Convert tint to Color if string
  const tintColor = typeof p.tint === 'string' ? new THREE.Color(p.tint) : p.tint
  const attenuationColor =
    typeof p.attenuationColor === 'string'
      ? new THREE.Color(p.attenuationColor)
      : p.attenuationColor

  return new THREE.MeshPhysicalMaterial({
    // Base properties
    color: tintColor,
    transparent: true,
    side: THREE.DoubleSide,

    // Transmission (glass-like)
    transmission: p.transmission,
    thickness: p.thickness,
    ior: p.ior,
    roughness: p.roughness,

    // Attenuation (color tinting through glass)
    attenuationColor: attenuationColor,
    attenuationDistance: p.attenuationDistance,

    // Environment reflections
    envMapIntensity: p.envMapIntensity,

    // Clearcoat for extra specular
    clearcoat: p.clearcoat,
    clearcoatRoughness: p.clearcoatRoughness,

    // Metalness should be 0 for glass
    metalness: 0,
  })
}

/**
 * Updates an existing Liquid Glass material with new parameters
 */
export function updateLiquidGlassMaterial(
  material: THREE.MeshPhysicalMaterial,
  params: Partial<LiquidGlassParams>
): void {
  if (params.transmission !== undefined) {
    material.transmission = params.transmission
  }
  if (params.roughness !== undefined) {
    material.roughness = params.roughness
  }
  if (params.thickness !== undefined) {
    material.thickness = params.thickness
  }
  if (params.ior !== undefined) {
    material.ior = params.ior
  }
  if (params.envMapIntensity !== undefined) {
    material.envMapIntensity = params.envMapIntensity
  }
  if (params.clearcoat !== undefined) {
    material.clearcoat = params.clearcoat
  }
  if (params.tint !== undefined) {
    const color = typeof params.tint === 'string' ? new THREE.Color(params.tint) : params.tint
    material.color.copy(color)
  }

  material.needsUpdate = true
}

/**
 * Material presets for different use cases
 */
export const LiquidGlassPresets = {
  // Standard card/panel material
  standard: (): THREE.MeshPhysicalMaterial =>
    createLiquidGlassMaterial({
      transmission: 0.92,
      roughness: 0.12,
      thickness: 0.03,
    }),

  // Frosted/blurred material
  frosted: (): THREE.MeshPhysicalMaterial =>
    createLiquidGlassMaterial({
      transmission: 0.85,
      roughness: 0.35,
      thickness: 0.05,
    }),

  // Clear glass with minimal blur
  clear: (): THREE.MeshPhysicalMaterial =>
    createLiquidGlassMaterial({
      transmission: 0.98,
      roughness: 0.02,
      thickness: 0.02,
    }),

  // High contrast for accessibility
  highContrast: (): THREE.MeshPhysicalMaterial =>
    createLiquidGlassMaterial({
      reducedTransparency: true,
    }),

  // Tinted glass (for accent elements)
  tinted: (color: string): THREE.MeshPhysicalMaterial =>
    createLiquidGlassMaterial({
      transmission: 0.88,
      roughness: 0.15,
      tint: color,
      attenuationColor: color,
    }),
}
