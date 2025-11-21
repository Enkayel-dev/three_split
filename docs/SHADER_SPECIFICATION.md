# Material & Shader Specification: Liquid Glass

## Overview

This document specifies the complete technical implementation of the Liquid Glass material system. It covers the rendering pipeline, shader architecture, mathematical models, and parameter specifications required to achieve Apple's Liquid Glass aesthetic.

---

## High-Level Material Model

Liquid Glass combines multiple rendering techniques:

1. **PBR Glass (Transmission)** - Physically-based transparent material
2. **Screen-Space Refraction** - Real-time content distortion
3. **Blurred Backplate** - Frosted glass effect
4. **Fresnel & Specular** - Edge highlights and reflections
5. **Subtle Dispersion** - Chromatic aberration hints
6. **Dynamic Normal Perturbation** - Motion-driven distortion

```
Final Output = Refracted + Blurred Blend + Specular + Rim + Tint
```

---

## Render Pipeline Architecture

### Pass Order

```
┌─────────────────────────────────────────────────────────┐
│ Pass 1: Opaque/Background                               │
│   - Render environment, background assets               │
│   - Output: Color Buffer (full resolution)              │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│ Pass 2: Depth Buffer                                    │
│   - Render scene depth                                  │
│   - Output: Depth Buffer                                │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│ Pass 3: Normal Buffer (Glass Surfaces Only)             │
│   - Render per-pixel normals of glass objects           │
│   - Output: Normal Buffer (RGB = XYZ)                   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│ Pass 4: Blur Pass                                       │
│   - Downsample Color Buffer to 50%                      │
│   - Apply separable Gaussian blur (X then Y)            │
│   - Output: Blurred Buffer                              │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│ Pass 5: Glass Shading Pass                              │
│   - For each glass fragment:                            │
│     - Compute refraction UV offset                      │
│     - Sample Color Buffer at refracted coords           │
│     - Sample Blur Buffer at screen coords               │
│     - Blend based on glass clarity                      │
│     - Add specular + rim highlights                     │
│     - Apply tint and attenuation                        │
│   - Output: Composited Frame                            │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│ Pass 6: Post-Processing (Optional)                      │
│   - Film grain (very subtle)                            │
│   - Vignette (subtle)                                   │
│   - Tone mapping                                        │
│   - Output: Final Frame                                 │
└─────────────────────────────────────────────────────────┘
```

---

## Shader Mathematics

### Fresnel Calculation

The Fresnel effect creates brighter edges at glancing angles:

```glsl
float computeFresnel(vec3 normal, vec3 viewDir, float power) {
    float NdotV = max(dot(normal, viewDir), 0.0);
    return pow(1.0 - NdotV, power);
}
```

**Parameters:**
- `power`: 2.0 - 4.0 (higher = sharper edge falloff)
- Typical value: 2.5

### Refraction Vector

Screen-space refraction approximation:

```glsl
vec2 computeRefractionOffset(vec3 normal, float strength, float fresnel) {
    // Project normal to screen space
    vec2 offset = normalize(normal.xy) * strength;

    // Modulate by Fresnel (stronger refraction at edges)
    offset *= (0.5 + fresnel * 0.5);

    return offset;
}
```

### Refracted UV Sampling

```glsl
vec2 refractedUV = screenUV + computeRefractionOffset(N, refractionStrength, fresnel);

// Clamp to valid UV range to prevent edge artifacts
refractedUV = clamp(refractedUV, 0.001, 0.999);
```

### Glass Clarity Blend

Blend between sharp refracted sample and blurred sample:

```glsl
float clarity = smoothstep(0.0, 1.0, 1.0 - roughness);
vec4 finalColor = mix(blurredColor, refractedColor, clarity);
```

### Specular Highlight

```glsl
vec3 computeSpecular(vec3 normal, vec3 viewDir, vec3 lightDir, float intensity) {
    vec3 halfVec = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfVec), 0.0), 64.0);
    return vec3(spec * intensity);
}
```

### Rim Light

```glsl
vec3 computeRim(vec3 normal, vec3 viewDir, vec3 rimColor, float power, float intensity) {
    float rim = pow(1.0 - max(dot(normal, viewDir), 0.0), power);
    return rimColor * rim * intensity;
}
```

### Attenuation (Thickness-Based Tinting)

```glsl
vec3 applyAttenuation(vec3 color, vec3 tint, float thickness, float distance) {
    vec3 attenuation = exp(-distance * thickness * (1.0 - tint));
    return color * attenuation;
}
```

---

## Complete Fragment Shader

```glsl
#version 300 es
precision highp float;

// Uniforms
uniform sampler2D u_colorBuffer;      // Scene color
uniform sampler2D u_blurBuffer;       // Blurred scene
uniform sampler2D u_depthBuffer;      // Scene depth
uniform sampler2D u_normalMap;        // Optional normal map
uniform vec2 u_resolution;
uniform float u_time;

// Material parameters
uniform float u_ior;                  // Index of refraction
uniform float u_transmission;         // Transparency
uniform float u_roughness;            // Blur amount
uniform float u_thickness;            // Glass thickness
uniform float u_fresnelPower;         // Edge brightness falloff
uniform float u_specIntensity;        // Specular strength
uniform float u_rimPower;             // Rim light falloff
uniform float u_rimIntensity;         // Rim light strength
uniform float u_refractionStrength;   // Distortion amount
uniform vec3 u_tint;                  // Glass tint color
uniform vec3 u_rimColor;              // Rim light color

// Varyings
in vec2 v_uv;
in vec3 v_normal;
in vec3 v_viewDir;
in vec3 v_worldPos;

out vec4 fragColor;

void main() {
    // Get screen UV
    vec2 screenUV = gl_FragCoord.xy / u_resolution;

    // Normal (can be perturbed by normal map or time)
    vec3 N = normalize(v_normal);

    // Optional: Add subtle time-based perturbation for "liquid" feel
    // N += sin(u_time * 2.0 + v_worldPos.x * 10.0) * 0.01;
    // N = normalize(N);

    // View direction
    vec3 V = normalize(v_viewDir);

    // Fresnel
    float fresnel = pow(1.0 - max(dot(N, V), 0.0), u_fresnelPower);

    // Refraction offset
    vec2 refractionOffset = normalize(N.xy) * u_refractionStrength * (0.5 + fresnel);
    vec2 refractedUV = clamp(screenUV + refractionOffset, 0.001, 0.999);

    // Sample color buffer at refracted position
    vec4 refractedColor = texture(u_colorBuffer, refractedUV);

    // Sample blurred buffer at original position
    vec4 blurredColor = texture(u_blurBuffer, screenUV + refractionOffset * 0.3);

    // Glass clarity (inverse of roughness)
    float clarity = smoothstep(0.0, 1.0, 1.0 - u_roughness);

    // Blend refracted and blurred based on clarity
    vec4 baseColor = mix(blurredColor, refractedColor, clarity * 0.7);

    // Apply tint and attenuation
    baseColor.rgb *= u_tint;
    baseColor.rgb *= exp(-u_thickness * 0.5 * (1.0 - u_tint));

    // Specular highlight (assuming light from above-camera)
    vec3 lightDir = normalize(vec3(0.3, 1.0, 0.5));
    vec3 halfVec = normalize(lightDir + V);
    float spec = pow(max(dot(N, halfVec), 0.0), 64.0);
    vec3 specular = vec3(spec * u_specIntensity);

    // Rim light
    float rim = pow(1.0 - max(dot(N, V), 0.0), u_rimPower);
    vec3 rimLight = u_rimColor * rim * u_rimIntensity;

    // Final composition
    vec3 finalColor = baseColor.rgb + specular + rimLight;

    // Transmission (alpha)
    float alpha = u_transmission + fresnel * 0.1;

    fragColor = vec4(finalColor, alpha);
}
```

---

## Parameter Reference

### Default Values

| Parameter | Default | Range | Description |
|-----------|---------|-------|-------------|
| `ior` | 1.45 | 1.0 - 2.0 | Index of refraction (glass ~1.5) |
| `transmission` | 0.92 | 0.0 - 1.0 | Base transparency |
| `roughness` | 0.12 | 0.0 - 1.0 | Blur/frost amount |
| `thickness` | 0.03 | 0.01 - 0.1 | Affects attenuation |
| `fresnelPower` | 2.5 | 1.0 - 5.0 | Edge brightness falloff |
| `specIntensity` | 0.18 | 0.0 - 1.0 | Specular highlight strength |
| `rimPower` | 3.0 | 1.0 - 5.0 | Rim light falloff |
| `rimIntensity` | 0.08 | 0.0 - 0.5 | Rim light strength |
| `refractionStrength` | 0.02 | 0.01 - 0.05 | UV displacement amount |
| `glassClarity` | 0.6 | 0.0 - 1.0 | Blur vs sharp blend |
| `dispersionAmount` | 0.002 | 0.0 - 0.01 | Chromatic aberration |
| `tint` | `(1,1,1)` | RGB | Glass color tint |
| `rimColor` | `(1,1,1)` | RGB | Rim highlight color |

### State-Based Modifications

| State | Parameter Changes |
|-------|-------------------|
| **Hover** | `fresnelPower` -0.3, `specIntensity` +0.06 |
| **Press** | `refractionStrength` +0.04, `roughness` +0.05 |
| **Disabled** | `transmission` -0.3, `roughness` +0.2 |

---

## Blur Pass Implementation

### Separable Gaussian Blur

Two-pass blur for efficiency:

```glsl
// Horizontal pass
vec4 blurH(sampler2D tex, vec2 uv, vec2 resolution, float radius) {
    vec4 sum = vec4(0.0);
    float weights[5] = float[](0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);

    for (int i = -4; i <= 4; i++) {
        float weight = weights[abs(i)];
        vec2 offset = vec2(float(i) * radius / resolution.x, 0.0);
        sum += texture(tex, uv + offset) * weight;
    }

    return sum;
}

// Vertical pass (same, swap x/y)
vec4 blurV(sampler2D tex, vec2 uv, vec2 resolution, float radius) {
    vec4 sum = vec4(0.0);
    float weights[5] = float[](0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);

    for (int i = -4; i <= 4; i++) {
        float weight = weights[abs(i)];
        vec2 offset = vec2(0.0, float(i) * radius / resolution.y);
        sum += texture(tex, uv + offset) * weight;
    }

    return sum;
}
```

### Blur Parameters

| Parameter | Value | Notes |
|-----------|-------|-------|
| Downsample | 50% | Half resolution for blur |
| Kernel Size | 9 samples | Balance quality/performance |
| Radius | 8-16 pixels | Adjustable per device |
| Passes | 2 (H + V) | Separable for efficiency |

---

## Chromatic Dispersion (Optional)

Subtle RGB channel separation for realism:

```glsl
vec4 sampleWithDispersion(sampler2D tex, vec2 uv, vec2 offset, float amount) {
    float r = texture(tex, uv + offset * (1.0 + amount)).r;
    float g = texture(tex, uv + offset).g;
    float b = texture(tex, uv + offset * (1.0 - amount)).b;
    return vec4(r, g, b, 1.0);
}
```

**Note**: Use very subtle values (0.001 - 0.005) to avoid visual noise.

---

## Depth-Aware Refraction

Prevent sampling behind occluders:

```glsl
float sceneDepth = texture(u_depthBuffer, refractedUV).r;
float glassDepth = gl_FragCoord.z;

// If refracted sample is closer than glass, fallback to blur
if (sceneDepth < glassDepth - 0.01) {
    refractedColor = blurredColor;
}
```

---

## Dynamic Normal Perturbation

For "liquid" motion effect:

```glsl
vec3 perturbNormal(vec3 normal, vec3 worldPos, float time, float strength) {
    // Procedural noise-based perturbation
    float noise = sin(worldPos.x * 10.0 + time * 2.0) *
                  cos(worldPos.y * 8.0 + time * 1.5) * 0.5 + 0.5;

    vec3 perturb = vec3(
        sin(time + worldPos.x * 5.0),
        cos(time + worldPos.y * 5.0),
        0.0
    ) * strength * noise;

    return normalize(normal + perturb);
}
```

**Use on hover** to create subtle "breathing" effect.

---

## Performance LOD Levels

### LOD 0: High (Desktop)

- Full resolution color buffer
- Full blur pass
- Dispersion enabled
- All normal perturbation

### LOD 1: Medium (Laptop/Tablet)

- Full resolution color
- 50% resolution blur
- No dispersion
- Reduced normal perturbation

### LOD 2: Low (Mobile High-End)

- 75% resolution color
- 25% resolution blur
- No dispersion
- No perturbation

### LOD 3: Fallback (Mobile Low-End)

- No screen-space refraction
- Simple semi-transparent material
- Solid blur background
- No real-time effects

---

## Three.js Implementation

### Using MeshPhysicalMaterial (Base)

```typescript
import * as THREE from 'three';

const liquidGlassMaterial = new THREE.MeshPhysicalMaterial({
  transmission: 0.92,
  roughness: 0.12,
  thickness: 0.03,
  ior: 1.45,
  transparent: true,
  side: THREE.DoubleSide,

  // Clearcoat for extra specular
  clearcoat: 0.1,
  clearcoatRoughness: 0.1,

  // Environment for reflections
  envMapIntensity: 1.2,
});
```

### Custom ShaderMaterial (Advanced)

```typescript
import * as THREE from 'three';
import { extend, useFrame } from '@react-three/fiber';

const LiquidGlassMaterial = shaderMaterial(
  {
    u_colorBuffer: null,
    u_blurBuffer: null,
    u_resolution: new THREE.Vector2(),
    u_time: 0,
    u_ior: 1.45,
    u_transmission: 0.92,
    u_roughness: 0.12,
    u_refractionStrength: 0.02,
    u_fresnelPower: 2.5,
    // ... other uniforms
  },
  vertexShader,
  fragmentShader
);

extend({ LiquidGlassMaterial });
```

---

## Render Target Setup

```typescript
// Color buffer (full resolution)
const colorTarget = new THREE.WebGLRenderTarget(
  window.innerWidth,
  window.innerHeight,
  {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.HalfFloatType,
  }
);

// Blur buffer (half resolution)
const blurTarget = new THREE.WebGLRenderTarget(
  window.innerWidth / 2,
  window.innerHeight / 2,
  {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
  }
);
```

---

## Shader Debugging

### Visualize Normals

```glsl
// Debug: output normals as colors
fragColor = vec4(N * 0.5 + 0.5, 1.0);
```

### Visualize Fresnel

```glsl
// Debug: output fresnel as grayscale
fragColor = vec4(vec3(fresnel), 1.0);
```

### Visualize Refraction Offset

```glsl
// Debug: output refraction offset as color
vec2 offset = computeRefractionOffset(N, u_refractionStrength, fresnel);
fragColor = vec4(offset * 10.0 + 0.5, 0.0, 1.0);
```

---

## Quality Checklist

- [ ] Refraction distorts background convincingly
- [ ] Blur is smooth without banding
- [ ] Fresnel creates visible but subtle edge brightness
- [ ] Specular highlights appear at correct angles
- [ ] Rim light enhances depth perception
- [ ] No artifacts at UV boundaries
- [ ] Performance within budget (60 FPS desktop)
- [ ] LOD transitions are smooth
- [ ] Accessibility fallback renders correctly

---

*This shader specification defines the technical implementation of Liquid Glass materials. All visual effects should conform to these parameters and mathematics.*
