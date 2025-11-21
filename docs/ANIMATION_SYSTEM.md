# Animation & Motion System

## Overview

This document defines the complete animation language for the Liquid Glass website. Motion is not decorative—it communicates state, provides feedback, and creates a sense of physicality. Every animation should feel purposeful and alive.

---

## Motion Philosophy

### Core Principles

1. **Motion as Intent** — Every animation communicates meaning
2. **Organic Feel** — Movement should feel natural, not mechanical
3. **Proportional Response** — Animation intensity matches interaction intensity
4. **Seamless Transitions** — State changes flow, never snap
5. **Respect Preferences** — Honor reduced-motion settings

### The "Liquid" Quality

Liquid Glass motion should feel like:
- Water flowing around obstacles
- Mercury pooling and separating
- Soft elastic materials stretching and settling
- Light refracting through moving glass

---

## Timing Tokens

### Duration Scale

| Token | Duration | Use Case |
|-------|----------|----------|
| `instant` | 0ms | Immediate state change (a11y) |
| `fast` | 120ms | Button press, micro-interactions |
| `medium` | 280ms | Hover states, small transitions |
| `slow` | 500-600ms | Panel reveals, morphing |
| `pageTransit` | 800-1000ms | Camera transitions between nodes |
| `entrance` | 400-600ms | Initial load animations |

### Duration Guidelines

- **Small interactions** (button tap): 80-150ms
- **Medium transitions** (hover, focus): 200-350ms
- **Large reveals** (modal open): 400-700ms
- **Scene transitions** (camera move): 800-1200ms

---

## Easing Functions

### Standard Curves

| Name | CSS Cubic-Bezier | Use Case |
|------|------------------|----------|
| `easeOut` | `cubic-bezier(0.0, 0.0, 0.2, 1)` | Entrances, reveals |
| `easeIn` | `cubic-bezier(0.4, 0.0, 1, 1)` | Exits, dismissals |
| `easeInOut` | `cubic-bezier(0.4, 0.0, 0.2, 1)` | Symmetric transitions |
| `smooth` | `cubic-bezier(0.2, 0.85, 0.25, 1)` | Camera movement |
| `bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful interactions |

### Spring Configurations (react-spring)

| Name | Config | Use Case |
|------|--------|----------|
| `gentle` | `{ tension: 120, friction: 14 }` | General purpose |
| `snappy` | `{ tension: 180, friction: 12 }` | Quick responses |
| `wobbly` | `{ tension: 180, friction: 20, mass: 2 }` | Playful bounces |
| `stiff` | `{ tension: 210, friction: 20 }` | Firm feedback |
| `molasses` | `{ tension: 100, friction: 30 }` | Slow, deliberate |

### Example Spring Usage

```typescript
import { useSpring, animated } from '@react-spring/three';

const [spring, api] = useSpring(() => ({
  scale: 1,
  config: { tension: 120, friction: 14 },
}));

// On hover
api.start({ scale: 1.03 });

// On hover end
api.start({ scale: 1 });
```

---

## Interaction Animations

### Hover State

**Trigger**: Pointer enters component
**Duration**: 120ms in, 200ms out
**Changes**:

```typescript
{
  scale: 1.03,
  fresnel: +0.06,
  // Subtle ripple effect on surface
}
```

**Implementation**:

```typescript
const hoverAnimation = {
  from: { scale: 1, fresnelBoost: 0 },
  to: { scale: 1.03, fresnelBoost: 0.06 },
  config: { tension: 180, friction: 12 },
};
```

### Press/Active State

**Trigger**: Pointer down
**Duration**: 120ms in
**Changes**:

```typescript
{
  scale: 0.98,
  scaleY: 0.95, // Tactile "press-in"
  refractionStrength: +0.04,
  shadowBlur: +2,
}
```

### Release State

**Trigger**: Pointer up
**Duration**: 220ms with elastic overshoot
**Changes**:

```typescript
{
  scale: 1.0 → 1.02 → 1.0, // Overshoot then settle
}
```

**Spring Config**:

```typescript
{ tension: 180, friction: 12 }
// Creates natural elastic rebound
```

### Focus State

**Trigger**: Keyboard focus
**Duration**: Instant (accessibility)
**Changes**:

```typescript
{
  outline: 'visible',
  outlineOffset: 0.01,
  // Enhanced contrast
}
```

---

## Camera Transitions

### Between Nodes

**Method**: Bezier spline interpolation
**Duration**: 800-1000ms
**Easing**: `cubic-bezier(0.2, 0.85, 0.25, 1)`

**Implementation**:

```typescript
import { CubicBezierCurve3 } from 'three';

const transitionSpline = new CubicBezierCurve3(
  startPosition,  // Current camera pos
  controlPoint1,  // Curve control (arc up)
  controlPoint2,  // Curve control (arc down)
  endPosition     // Target camera pos
);

// Animate along spline
function animateCamera(progress: number) {
  const point = transitionSpline.getPoint(progress);
  camera.position.copy(point);
  camera.lookAt(targetLookAt);
}
```

### Parallax Motion

**Trigger**: Pointer movement / device orientation
**Response**: Continuous, subtle
**Maximum Offset**: 20-40px equivalent

```typescript
const parallaxOffset = {
  x: pointerX * 0.02,
  y: pointerY * 0.02,
};

// Apply to background elements only
backgroundGroup.position.x = parallaxOffset.x;
backgroundGroup.position.y = parallaxOffset.y;
```

---

## Component Animations

### Card Idle Oscillation

Floating cards have subtle ambient motion:

```typescript
const idleOscillation = {
  y: Math.sin(time * 0.5) * 0.03, // ±0.03m vertical
  rotation: Math.sin(time * 0.3) * 0.02, // ±0.02 radians
};
```

**Frequency**: ~0.5Hz (very slow)
**Amplitude**: ±0.03-0.06m

### Card Expansion (to Modal)

**Duration**: 500-700ms
**Sequence**:

1. Card scales to 1.3x (0-200ms)
2. Camera moves slightly back (0-400ms)
3. Card morphs to modal shape (200-600ms)
4. Content fades in (400-700ms)

```typescript
const expansionSequence = async () => {
  await api.start({ scale: 1.3 }, { duration: 200 });
  await Promise.all([
    cameraApi.start({ z: camera.z + 0.5 }),
    api.start({ width: modalWidth, height: modalHeight }),
  ]);
  await contentApi.start({ opacity: 1 });
};
```

### Card Collapse (from Modal)

**Duration**: 400ms
**Reverse of expansion**, faster pace

### Panel Entrance (Staggered)

When entering a node, cards appear sequentially:

```typescript
const staggerDelay = 60; // ms between each card

cards.forEach((card, index) => {
  setTimeout(() => {
    card.api.start({
      opacity: 1,
      y: targetY,
      from: { opacity: 0, y: targetY + 0.1 },
    });
  }, index * staggerDelay);
});
```

---

## Glass Material Animations

### Fresnel Pulse (Hover)

```typescript
// Subtle Fresnel intensity pulse on hover
const fresnelAnimation = useSpring({
  fresnelPower: hovered ? 2.2 : 2.5, // Lower = brighter edges
  config: { tension: 120, friction: 14 },
});
```

### Refraction Ripple

On interaction, a ripple propagates across the glass surface:

```glsl
// In fragment shader
float ripple = sin(distance(uv, interactionPoint) * 20.0 - time * 10.0);
ripple *= exp(-distance(uv, interactionPoint) * 5.0); // Decay with distance
normal.xy += ripple * 0.05;
```

### Dynamic Normal Perturbation

Subtle, time-based normal animation for "living" glass:

```glsl
float perturbation = sin(worldPos.x * 10.0 + time * 2.0) *
                     cos(worldPos.y * 8.0 + time * 1.5) * 0.02;
normal = normalize(normal + vec3(perturbation, perturbation, 0));
```

---

## Motion Choreography

### Entrance Sequence (Page Load)

1. **0-300ms**: Background fades in
2. **200-600ms**: Environment stabilizes
3. **400-800ms**: Primary cards enter (staggered)
4. **600-1000ms**: Secondary elements appear
5. **800-1200ms**: Interactions enabled

### Node Transition Sequence

1. **0-100ms**: Current cards begin fade/exit
2. **0-800ms**: Camera moves along spline
3. **400-1200ms**: New cards enter (staggered)
4. **800-1400ms**: Settle and enable interactions

### Modal Open Sequence

1. **0-100ms**: Background dims
2. **0-200ms**: Source card begins scale
3. **100-500ms**: Morph to modal shape
4. **300-600ms**: Content fades in
5. **500-700ms**: Focus trap activated

---

## Reduced Motion Mode

When `prefers-reduced-motion: reduce`:

### Disabled Animations

- ❌ Idle oscillation
- ❌ Parallax
- ❌ Ripple effects
- ❌ Normal perturbation
- ❌ Spring bounces
- ❌ Morphing

### Allowed/Modified

- ✓ Opacity fades (200ms max)
- ✓ Instant state changes
- ✓ Camera cuts (no spline, instant)
- ✓ Focus indicators

### Implementation

```typescript
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const animationConfig = reducedMotion
  ? { duration: 0 }
  : { tension: 120, friction: 14 };

const cameraTransition = reducedMotion
  ? instantMove
  : splineTransition;
```

---

## Animation State Machine

### Card States

```
       ┌──────────────────────┐
       │                      │
       ▼                      │
    ┌──────┐    hover     ┌───────┐
    │ Idle │─────────────▶│ Hover │
    └──────┘              └───────┘
       ▲                      │
       │                      │ click
       │    exit              ▼
       │              ┌───────────┐
       └──────────────│  Active   │
                      └───────────┘
                           │
                           │ expand
                           ▼
                      ┌───────────┐
                      │ Expanded  │
                      └───────────┘
```

### State Transitions

| From | To | Animation |
|------|-----|-----------|
| Idle → Hover | Scale up, Fresnel boost | 120ms spring |
| Hover → Idle | Scale down, Fresnel normal | 200ms spring |
| Hover → Active | Scale down, press-in | 120ms linear |
| Active → Hover | Elastic rebound | 220ms spring |
| Active → Expanded | Scale + morph | 500ms sequence |
| Expanded → Idle | Collapse + morph | 400ms sequence |

---

## Performance Optimization

### Animation Budget

- **Max concurrent animations**: 10
- **Max spring calculations/frame**: 20
- **Target frame time**: < 16ms

### Optimization Strategies

1. **Use `will-change`** sparingly for GPU-accelerated properties
2. **Batch animations** that can run together
3. **Throttle parallax** updates to 30fps
4. **Pause idle animations** when tab is hidden
5. **Use LOD for complex animations** at distance

### Animation Culling

```typescript
// Only animate visible elements
const isVisible = useIntersectionObserver(ref);

useFrame(() => {
  if (!isVisible) return;
  // Animation logic
});
```

---

## Code Examples

### Complete Hover Animation (R3F)

```typescript
import { useSpring, animated } from '@react-spring/three';
import { useRef } from 'react';

function GlassCard({ children, onClick }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  const { scale, fresnelBoost } = useSpring({
    scale: hovered ? 1.03 : 1,
    fresnelBoost: hovered ? 0.06 : 0,
    config: { tension: 180, friction: 12 },
  });

  return (
    <animated.mesh
      ref={meshRef}
      scale={scale}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <roundedBoxGeometry args={[0.9, 0.5, 0.03, 4, 0.04]} />
      <liquidGlassMaterial fresnelBoost={fresnelBoost} />
      {children}
    </animated.mesh>
  );
}
```

### Camera Spline Transition

```typescript
import { useFrame } from '@react-three/fiber';
import { CubicBezierCurve3, Vector3 } from 'three';

function useCameraTransition() {
  const progress = useRef(0);
  const spline = useRef<CubicBezierCurve3 | null>(null);
  const isTransitioning = useRef(false);

  const transitionTo = useCallback((from: Vector3, to: Vector3, duration = 900) => {
    const control1 = new Vector3().lerpVectors(from, to, 0.25);
    control1.y += 0.3; // Arc up

    const control2 = new Vector3().lerpVectors(from, to, 0.75);
    control2.y += 0.1;

    spline.current = new CubicBezierCurve3(from, control1, control2, to);
    progress.current = 0;
    isTransitioning.current = true;
  }, []);

  useFrame((state, delta) => {
    if (!isTransitioning.current || !spline.current) return;

    progress.current += delta / 0.9; // 900ms duration

    if (progress.current >= 1) {
      progress.current = 1;
      isTransitioning.current = false;
    }

    // Apply easing
    const t = easeInOutCubic(progress.current);
    const point = spline.current.getPoint(t);
    state.camera.position.copy(point);
  });

  return { transitionTo };
}

function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
```

---

## Animation Tokens (JSON)

```json
{
  "timing": {
    "instant": 0,
    "fast": 120,
    "medium": 280,
    "slow": 600,
    "pageTransit": 900,
    "entrance": 500
  },
  "spring": {
    "gentle": { "tension": 120, "friction": 14 },
    "snappy": { "tension": 180, "friction": 12 },
    "wobbly": { "tension": 180, "friction": 20, "mass": 2 },
    "stiff": { "tension": 210, "friction": 20 },
    "molasses": { "tension": 100, "friction": 30 }
  },
  "easing": {
    "easeOut": "cubic-bezier(0.0, 0.0, 0.2, 1)",
    "easeIn": "cubic-bezier(0.4, 0.0, 1, 1)",
    "easeInOut": "cubic-bezier(0.4, 0.0, 0.2, 1)",
    "smooth": "cubic-bezier(0.2, 0.85, 0.25, 1)",
    "bounce": "cubic-bezier(0.34, 1.56, 0.64, 1)"
  },
  "values": {
    "hoverScale": 1.03,
    "pressScale": 0.98,
    "oscillationAmplitude": 0.03,
    "oscillationFrequency": 0.5,
    "parallaxMax": 0.02,
    "staggerDelay": 60
  }
}
```

---

*This animation system defines how everything moves in the Liquid Glass website. Follow these specifications for consistent, delightful motion.*
