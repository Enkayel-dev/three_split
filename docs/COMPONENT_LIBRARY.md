# 3D UI Component Library Specification

## Overview

This document specifies every interactive 3D component in the Liquid Glass website. Each component is a physical 3D object with defined geometry, material parameters, interaction states, and accessibility variants.

---

## Global Guidelines

### Units & Scale
- **1 unit = 1 meter** in Blender and GLTF
- All components use meters for dimensions
- Maintain real-world scale for optical plausibility

### Composability
- Components should be modular and combinable
- Small parts combine to form complex UI
- Shared material instances where appropriate

### Accessibility Requirements
- Every 3D component must have an HTML semantic counterpart
- Alt text and ARIA labels for all interactive elements
- Focus states must be visible and clear

---

## Component Catalog

### 1. Glass Panel (Base Component)

**Purpose**: Generic surface for content (foundation for cards, toolbars, modals)

#### Geometry Specification

| Property | Value | Notes |
|----------|-------|-------|
| Shape | Rounded rectangle | Front face + solid extrusion |
| Width | 0.8m (default) | Scalable |
| Height | 0.5m (default) | Scalable |
| Thickness | 0.02 - 0.05m | Affects refraction |
| Corner Radius | 0.04m | Bevel radius |
| Bevel | 0.005 - 0.015m | Edge softening |
| Poly Count | < 500 tris | Base mesh |

#### Material Parameters (Default)

```json
{
  "ior": 1.45,
  "transmission": 0.90,
  "roughness": 0.15,
  "thickness": 0.03,
  "fresnelPower": 2.5,
  "specIntensity": 0.18,
  "rimPower": 3.0,
  "rimIntensity": 0.08,
  "refractionStrength": 0.02,
  "glassClarity": 0.6,
  "tint": "rgba(255,255,255,0.06)"
}
```

#### Interaction States

| State | Visual Changes | Duration |
|-------|----------------|----------|
| **Idle** | Base parameters | - |
| **Hover** | Scale 1.03, fresnelBoost +0.08, subtle ripple | 120ms |
| **Active/Pressed** | Scale 0.98, refractionStrength +0.06, shadow depth increase | 120ms |
| **Focus** | Visible outline ring, enhanced contrast | Instant |
| **Disabled** | Transmission 0.6, opacity increase | - |

#### Blender Export Settings

```
- Format: GLTF 2.0 / GLB
- Include: Tangents, Normals
- Transform: +Y Up, +Z Forward
- Extras metadata:
  {
    "componentType": "GlassPanel",
    "interactable": true,
    "initialState": "idle"
  }
```

---

### 2. Glass Card (Information Unit)

**Purpose**: Text + image content block, primary content container

#### Geometry Specification

| Property | Value | Notes |
|----------|-------|-------|
| Base | Glass Panel | Inherits geometry |
| Width | 0.9m | Standard |
| Height | 0.5 - 0.6m | Variable |
| Content Inset | 0.015m | For text plane |
| Image Area | Top 60% | If present |
| Text Area | Bottom 40% | Always present |

#### Content Structure

```
┌─────────────────────────────┐
│                             │
│        [Image Area]         │
│         (optional)          │
│                             │
├─────────────────────────────┤
│ Title                       │
│ Subtitle / Type             │
│ Brief description text...   │
└─────────────────────────────┘
```

#### Typography (3D)

For 3D text, use:
- **SDF (Signed Distance Field)** text rendering
- Or **HTML overlay** positioned with CSS 3D transforms

| Element | Size | Weight |
|---------|------|--------|
| Title | 20px equiv | 600 |
| Type/Subtitle | 12px equiv | 400 |
| Description | 14px equiv | 400 |

#### States

Same as Glass Panel, plus:

| State | Additional Changes |
|-------|-------------------|
| **Selected** | Border highlight, elevated z +0.02m |
| **Expanded** | Scale 1.3x, translate toward camera |

#### Variants

| Variant | Modifications |
|---------|---------------|
| Light Mode | Base tint white, dark text |
| Dark Mode | Base tint dark grey, light text |
| High Contrast | Opaque background, no blur |

---

### 3. Glass Button

**Purpose**: Action triggers (primary CTAs, secondary actions)

#### Geometry Specification

| Property | Value | Notes |
|----------|-------|-------|
| Shape | Rounded pill / puck | Capsule shape |
| Width | 0.15 - 0.3m | Based on label |
| Height | 0.05 - 0.08m | Standard |
| Thickness | 0.03 - 0.06m | Tactile depth |
| Corner Radius | 50% height | Fully rounded ends |

#### Material Modifications

| Variant | Modifications |
|---------|---------------|
| **Primary** | Emissive accent tint (low intensity), stronger Fresnel |
| **Secondary** | Standard glass, subtle border |
| **Ghost** | Very high transmission, minimal tint |

#### States

| State | Visual Changes | Timing |
|-------|----------------|--------|
| **Idle** | Base material | - |
| **Hover** | Scale 1.05, inner rim glow, Fresnel +0.06 | 80ms |
| **Press** | Scale 0.95 Y-axis, darken 10% | 120ms in |
| **Release** | Elastic rebound to idle | 220ms out |
| **Disabled** | 50% opacity, no interaction | - |
| **Loading** | Subtle pulse animation | Loop |

#### Press Animation Detail

```
Press In:
- Duration: 120ms
- Easing: linear
- Scale Y: 0.95
- Shadow: increase blur

Release Out:
- Duration: 220ms
- Easing: elastic (stiffness: 180, damping: 12)
- Scale: return to 1.0
- Slight overshoot (1.02) then settle
```

---

### 4. Toolbar / Header Bar

**Purpose**: Navigation container, action grouping

#### Geometry Specification

| Property | Value | Notes |
|----------|-------|-------|
| Shape | Long curved plane | Slight Y-axis curve |
| Width | 2.0 - 3.0m | Spans view |
| Height | 0.08 - 0.12m | Compact |
| Thickness | 0.015m | Thin |
| Curvature | 0.02m arc | Subtle concave |

#### Material

- Slightly more opaque than cards (transmission 0.85)
- Stronger blur (roughness 0.2)
- Buttons have enhanced rim highlight on toolbar

#### Behavior

| Behavior | Trigger | Animation |
|----------|---------|-----------|
| **Collapse** | Scroll down | Height → 0.04m, 300ms |
| **Expand** | Scroll up | Height → 0.12m, 300ms |
| **Fade** | Inactive 5s | Opacity → 0.3 |

#### Contents

- Logo/brand (left)
- Navigation items (center)
- Action buttons (right)
- Accessibility toggle (far right)

---

### 5. Modal / Fullscreen Panel

**Purpose**: Detailed content view, forms, expanded information

#### Geometry Specification

| Property | Value | Notes |
|----------|-------|-------|
| Shape | Large rounded rectangle | Matches card proportions |
| Width | 1.5 - 2.5m | Content-dependent |
| Height | 1.0 - 1.8m | Content-dependent |
| Thickness | 0.04m | Substantial |

#### Appearance Animation

```
Open:
1. Origin card serves as starting shape
2. Camera moves slightly backward to frame
3. Modal morphs from card scale to full scale
4. Blur increases synchronously
5. Duration: 500-700ms
6. Easing: easeOutCubic

Close:
1. Reverse morph to original card position
2. Duration: 400ms
3. Trigger: Escape key OR click outside
```

#### Content Layout

```
┌─────────────────────────────────────┐
│ [Close X]                     Title │  ← Header
├─────────────────────────────────────┤
│                                     │
│         [Primary Content]           │  ← Scrollable
│                                     │
│         Images, text, data          │
│                                     │
├─────────────────────────────────────┤
│      [Secondary Actions]   [Primary]│  ← Footer
└─────────────────────────────────────┘
```

#### Accessibility

- Focus trap when open
- Escape closes
- Announced to screen readers
- Scrollable content accessible via keyboard

---

### 6. Icon Plate / Badge

**Purpose**: Small iconic elements, status indicators

#### Geometry Specification

| Property | Value | Notes |
|----------|-------|-------|
| Shape | Circular disc | Or square with high radius |
| Diameter | 0.04 - 0.08m | Small |
| Thickness | 0.01 - 0.02m | Thin |

#### Material Modifications

- Stronger refraction (refractionStrength 0.04)
- More tint than cards (for icon visibility)
- Emissive for status indicators

#### Variants

| Variant | Use |
|---------|-----|
| Navigation Icon | Category indicators |
| Status Badge | Notification, online/offline |
| Action Icon | Inline button icons |

---

### 7. Form Input

**Purpose**: Text input fields, selects, textareas

#### Geometry Specification

| Property | Value | Notes |
|----------|-------|-------|
| Shape | Rounded rectangle | Inset appearance |
| Width | 0.4 - 0.8m | Field dependent |
| Height | 0.06m | Standard |
| Thickness | 0.008m | Very thin |

#### Visual Treatment

- Subtle inset shadow (appears recessed)
- Lighter interior than border
- Label floats above or left

#### States

| State | Visual |
|-------|--------|
| **Empty** | Placeholder text, subtle border |
| **Focus** | Border highlight, label animation |
| **Filled** | Visible value, border stable |
| **Error** | Red tint border, error icon |
| **Disabled** | Reduced opacity, no interaction |

---

### 8. Navigation Card

**Purpose**: Clickable navigation element with icon and label

#### Geometry Specification

Same as Glass Card but smaller:

| Property | Value |
|----------|-------|
| Width | 0.8m |
| Height | 0.5m |
| Thickness | 0.025m |

#### Content Structure

```
┌─────────────────────────┐
│                         │
│      [Large Icon]       │
│                         │
│        Label            │
└─────────────────────────┘
```

#### Interaction

- Hover: Scale 1.05, icon subtle bounce
- Click: Navigate to target node

---

## Component API (React Three Fiber)

### Props Interface

Every component exposes:

```typescript
interface GlassComponentProps {
  // Transform
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];

  // Variant
  variant?: 'light' | 'dark' | 'contrast';

  // State (can be controlled)
  state?: 'idle' | 'hover' | 'active' | 'disabled';

  // Events
  onHover?: () => void;
  onHoverEnd?: () => void;
  onClick?: () => void;
  onFocus?: () => void;

  // Material overrides
  materialParams?: Partial<LiquidGlassMaterial>;

  // Accessibility
  ariaLabel?: string;
  tabIndex?: number;

  // Children
  children?: React.ReactNode;
}
```

### Example Usage

```tsx
import { GlassCard } from '@/components/glass';

<GlassCard
  position={[0, 1.2, 0]}
  variant="light"
  onClick={() => navigate('/projects/1')}
  ariaLabel="View Brew Lab case study"
>
  <CardContent
    title="The Brew Lab"
    type="Operations Automation"
    summary="25% reduction in overhead"
  />
</GlassCard>
```

---

## Accessibility Variants

### Reduced Motion Mode

When `prefers-reduced-motion: reduce`:

| Change | Effect |
|--------|--------|
| Hover scale | Disabled |
| Oscillation | Disabled |
| Ripple effects | Disabled |
| Camera transitions | Instant or very fast (100ms) |
| Morphing | Fade instead of morph |

### Reduced Transparency Mode

When reduced transparency enabled:

| Change | Effect |
|--------|--------|
| Transmission | Reduced to 0.3 |
| Blur | Increased (roughness 0.6) |
| Background | Semi-opaque solid |
| Text contrast | Enhanced |

### High Contrast Mode

When `prefers-contrast: more`:

| Change | Effect |
|--------|--------|
| Glass material | Replaced with opaque |
| Borders | Solid, high contrast |
| Text | Maximum contrast |
| Focus indicators | Thick, visible outlines |

---

## Component JSON Schema

For task tracking and asset management:

```json
{
  "$schema": "component-spec-v1",
  "component": "GlassCard",
  "version": "1.0.0",
  "mesh": "card_v1.glb",
  "defaultSize": {
    "width": 0.9,
    "height": 0.5,
    "thickness": 0.03
  },
  "materialParams": {
    "ior": 1.45,
    "transmission": 0.92,
    "roughness": 0.12,
    "fresnelPower": 2.5,
    "refractionStrength": 0.02
  },
  "interactions": {
    "hover": {
      "scale": 1.03,
      "fresnelBoost": 0.06,
      "duration": 120
    },
    "press": {
      "scale": 0.98,
      "refractionAdd": 0.04,
      "duration": 120
    },
    "disabled": {
      "transmission": 0.6
    }
  },
  "accessibility": {
    "reducedMotion": {
      "disableMorph": true,
      "disableOscillation": true
    },
    "reducedTransparency": {
      "useOpaqueVariant": true
    },
    "highContrast": {
      "useSolidBackground": true,
      "enhanceBorders": true
    }
  },
  "variants": ["light", "dark", "contrast"],
  "states": ["idle", "hover", "active", "selected", "disabled"]
}
```

---

## Component Checklist

### Before Implementation

- [ ] Geometry modeled in Blender
- [ ] Material parameters defined
- [ ] All states documented
- [ ] Accessibility variants planned
- [ ] Animation timings specified
- [ ] Props interface designed

### During Implementation

- [ ] Base mesh imported and rendering
- [ ] Material shader applied correctly
- [ ] State transitions working
- [ ] Accessibility modes functional
- [ ] Props API complete
- [ ] HTML fallback layer working

### Quality Assurance

- [ ] Consistent with other components
- [ ] Performs within budget
- [ ] Accessible (keyboard, screen reader)
- [ ] Responsive to preferences
- [ ] Visually matches specification

---

*This component library specification is the source of truth for all 3D UI elements. Designers and developers should reference this document when creating or modifying components.*
