# MVP Layout & Scene Blueprint

## Overview

This document provides the spatial blueprint for the Liquid Glass 3D portfolio MVP. It defines exact positions, dimensions, camera paths, and object hierarchies for implementation in Blender and React Three Fiber.

---

## World Configuration

### Coordinate System

- **X-axis**: Left (-) to Right (+)
- **Y-axis**: Down (-) to Up (+)
- **Z-axis**: Away from camera (-) to Toward camera (+)

### Units

- **1 unit = 1 meter**
- All positions and dimensions in meters

### Environment

```json
{
  "environment": {
    "hdri": "studio_small.hdr",
    "hdriIntensity": 1.2,
    "backgroundColor": "#0a0a0f",
    "fog": {
      "enabled": true,
      "color": "#0a0a0f",
      "near": 5,
      "far": 20
    },
    "ambientLight": {
      "color": "#ffffff",
      "intensity": 0.3
    }
  }
}
```

---

## Scene Graph Hierarchy

```
SceneRoot
├── Environment
│   ├── HDRI Sphere
│   ├── Ambient Light
│   └── Fog
├── HomeHub
│   ├── HeroCard
│   ├── NavCard_Consulting
│   ├── NavCard_Software
│   ├── NavCard_Construction
│   └── FloatingLogo
├── ConsultingRoom
│   ├── BrewLabCard
│   ├── UrbanThreadsCard
│   ├── PeakPerformanceCard
│   └── CoastalImportsCard
├── SoftwareRoom
│   ├── LiquidLedgerCard
│   ├── DrakeBartendsCard
│   └── CryptoAnalyticsCard
├── ConstructionRoom
│   ├── ModernLuxuryCard
│   ├── AdaptiveWorkspaceCard
│   └── BoutiqueRetailCard
├── ContactNode
│   ├── FormPanel
│   └── CalendarCard
└── Overlays
    ├── Toolbar
    ├── SettingsModal
    └── ProjectDetailModal
```

---

## Node 1: Home Hub

### Overview

The entry point of the experience. A welcoming plaza with a hero message and navigation cards arranged radially.

### Camera Configuration

```json
{
  "camera": {
    "position": [-3, 1.5, 3],
    "lookAt": [0, 1.2, 0],
    "fov": 50,
    "near": 0.1,
    "far": 100
  }
}
```

### Objects

#### Hero Card

```json
{
  "id": "home-hero",
  "type": "GlassPanel",
  "position": [0, 1.2, 0],
  "rotation": [0, 0, 0],
  "size": {
    "width": 2.0,
    "height": 1.2,
    "thickness": 0.04
  },
  "content": {
    "title": "Crafting Systems, Spaces & Software",
    "subtitle": "Multi-disciplinary consultancy",
    "cta": "Explore Portfolio"
  },
  "interactions": {
    "hover": { "scale": 1.02, "fresnelBoost": 0.04 },
    "click": { "action": "navigateTo", "target": "consulting" }
  },
  "animation": {
    "idle": {
      "y": { "amplitude": 0.02, "frequency": 0.3 }
    }
  }
}
```

#### Navigation Card: Consulting

```json
{
  "id": "nav-consulting",
  "type": "GlassCard",
  "position": [-1.5, 0.8, -1.2],
  "rotation": [0, 0.2, 0],
  "size": {
    "width": 0.8,
    "height": 0.5,
    "thickness": 0.025
  },
  "content": {
    "icon": "chart-line",
    "label": "Consulting",
    "description": "Streamline operations"
  },
  "interactions": {
    "hover": { "scale": 1.05, "rotateY": 0.05 },
    "click": { "action": "navigateTo", "target": "consulting" }
  }
}
```

#### Navigation Card: Software

```json
{
  "id": "nav-software",
  "type": "GlassCard",
  "position": [0, 0.8, -1.2],
  "rotation": [0, 0, 0],
  "size": {
    "width": 0.8,
    "height": 0.5,
    "thickness": 0.025
  },
  "content": {
    "icon": "code",
    "label": "Software",
    "description": "Build custom tools"
  },
  "interactions": {
    "hover": { "scale": 1.05 },
    "click": { "action": "navigateTo", "target": "software" }
  }
}
```

#### Navigation Card: Construction

```json
{
  "id": "nav-construction",
  "type": "GlassCard",
  "position": [1.5, 0.8, -1.2],
  "rotation": [0, -0.2, 0],
  "size": {
    "width": 0.8,
    "height": 0.5,
    "thickness": 0.025
  },
  "content": {
    "icon": "building",
    "label": "Construction",
    "description": "Design spaces"
  },
  "interactions": {
    "hover": { "scale": 1.05, "rotateY": -0.05 },
    "click": { "action": "navigateTo", "target": "construction" }
  }
}
```

#### Floating Logo

```json
{
  "id": "floating-logo",
  "type": "IconPlate",
  "position": [0, 2, -0.5],
  "rotation": [0, 0, 0],
  "size": { "diameter": 0.3, "thickness": 0.02 },
  "animation": {
    "idle": {
      "rotateY": { "speed": 0.1, "continuous": true }
    }
  },
  "material": {
    "emissive": "#4A90D9",
    "emissiveIntensity": 0.3
  }
}
```

### Spatial Layout Diagram

```
Top View (Y = 0.8m for nav cards, Y = 1.2m for hero)

                    Z-
                    │
                    │
    [Consulting]    │    [Software]    │    [Construction]
    (-1.5, -1.2)    │    (0, -1.2)     │    (1.5, -1.2)
                    │
                    │
              [Hero Card]
                (0, 0)
                    │
                    │
                    │
X- ─────────────────┼───────────────── X+
                    │
                    │
                Camera
               (-3, 3)
                    │
                    Z+
```

---

## Node 2: Consulting Room

### Camera Configuration

```json
{
  "camera": {
    "position": [0, 1.5, 3],
    "lookAt": [0, 1.2, 0],
    "fov": 50
  }
}
```

### Objects

#### Card 1: The Brew Lab

```json
{
  "id": "consulting-brew-lab",
  "type": "GlassCard",
  "position": [-1.2, 1.0, 0],
  "rotation": [0, 0.3, 0],
  "size": { "width": 0.9, "height": 0.5, "thickness": 0.03 },
  "content": {
    "title": "The Brew Lab",
    "type": "Operations Automation",
    "summary": "25% reduction in overhead"
  },
  "interactions": {
    "hover": { "scale": 1.03, "fresnelBoost": 0.06 },
    "click": { "action": "expandModal", "data": "consulting-1" }
  },
  "animation": {
    "idle": { "y": { "amplitude": 0.02, "frequency": 0.4 } }
  }
}
```

#### Card 2: Urban Threads

```json
{
  "id": "consulting-urban-threads",
  "type": "GlassCard",
  "position": [0, 1.0, -1.2],
  "rotation": [0, 0, 0],
  "size": { "width": 0.9, "height": 0.5, "thickness": 0.03 },
  "content": {
    "title": "Urban Threads",
    "type": "Retail Streamlining",
    "summary": "40% fewer errors"
  },
  "interactions": {
    "hover": { "scale": 1.03, "fresnelBoost": 0.06 },
    "click": { "action": "expandModal", "data": "consulting-2" }
  }
}
```

#### Card 3: Peak Performance Gym

```json
{
  "id": "consulting-peak-performance",
  "type": "GlassCard",
  "position": [1.2, 1.0, 0.2],
  "rotation": [0, -0.3, 0],
  "size": { "width": 0.9, "height": 0.5, "thickness": 0.03 },
  "content": {
    "title": "Peak Performance Gym",
    "type": "Membership Optimization",
    "summary": "35% attendance increase"
  }
}
```

#### Card 4: Coastal Imports

```json
{
  "id": "consulting-coastal-imports",
  "type": "GlassCard",
  "position": [0, 1.0, 1.2],
  "rotation": [0, 3.14, 0],
  "size": { "width": 0.9, "height": 0.5, "thickness": 0.03 },
  "content": {
    "title": "Coastal Imports",
    "type": "Supply Chain",
    "summary": "45% faster fulfillment"
  }
}
```

### Spatial Layout

```
Top View (Y = 1.0m)

                    Z-
                    │
            [Urban Threads]
                (0, -1.2)
                    │
    [Brew Lab]      │      [Peak Performance]
    (-1.2, 0)  ─────┼─────  (1.2, 0.2)
                    │
                    │
            [Coastal Imports]
                (0, 1.2)
                    │
                    │
                Camera
                (0, 3)
                    Z+
```

---

## Node 3: Software Room

### Camera Configuration

```json
{
  "camera": {
    "position": [0, 1.8, 3.5],
    "lookAt": [0, 1.5, 0],
    "fov": 50
  }
}
```

### Objects

```json
{
  "cards": [
    {
      "id": "software-liquid-ledger",
      "position": [-1.5, 1.2, 0],
      "rotation": [0, 0.25, 0],
      "title": "Liquid Ledger",
      "type": "Financial Dashboard"
    },
    {
      "id": "software-drake-bartends",
      "position": [0, 1.2, -1.5],
      "rotation": [0, 0, 0],
      "title": "Drake Bartends Admin",
      "type": "Booking System"
    },
    {
      "id": "software-crypto-analytics",
      "position": [1.5, 1.2, 0],
      "rotation": [0, -0.25, 0],
      "title": "Crypto Analytics",
      "type": "Trading Dashboard"
    }
  ],
  "background": {
    "type": "ParticleGrid",
    "count": 100,
    "size": 0.02,
    "color": "#4A90D9",
    "opacity": 0.3,
    "animation": "dataFlow"
  }
}
```

### Spatial Layout

```
Top View (Y = 1.2m)

                    Z-
                    │
           [Drake Bartends]
               (0, -1.5)
                    │
                    │
[Liquid Ledger] ────┼──── [Crypto Analytics]
   (-1.5, 0)        │        (1.5, 0)
                    │
                    │
                Camera
               (0, 3.5)
                    Z+
```

---

## Node 4: Construction Room

### Camera Configuration

```json
{
  "camera": {
    "position": [0, 1.6, 3.2],
    "lookAt": [0, 1.5, 0],
    "fov": 50
  }
}
```

### Objects

```json
{
  "cards": [
    {
      "id": "construction-modern-luxury",
      "position": [-1.2, 1.0, 0],
      "rotation": [0, 0.2, 0],
      "title": "Modern Luxury Residence",
      "type": "Residential Design-Build"
    },
    {
      "id": "construction-adaptive-workspace",
      "position": [0, 1.0, -1.2],
      "rotation": [0, 0, 0],
      "title": "Adaptive Workspace",
      "type": "Office Renovation"
    },
    {
      "id": "construction-boutique-retail",
      "position": [1.2, 1.0, 0.2],
      "rotation": [0, -0.2, 0],
      "title": "Boutique Retail Shop",
      "type": "Retail Renovation"
    }
  ]
}
```

### Special Features

- Cards have slight rotation oscillation (±2° on Y-axis)
- Gallery-wall style arrangement with varied heights
- Click expands to show floor plans and renders

---

## Node 5: Contact Node

### Camera Configuration

```json
{
  "camera": {
    "position": [0, 1.4, 2.8],
    "lookAt": [0, 1.2, 0],
    "fov": 50
  }
}
```

### Objects

#### Form Panel

```json
{
  "id": "contact-form",
  "type": "GlassPanel",
  "position": [-0.3, 1.2, 0],
  "rotation": [0, 0.1, 0],
  "size": { "width": 1.2, "height": 0.8, "thickness": 0.04 },
  "content": {
    "heading": "Let's Work Together",
    "fields": ["name", "email", "service", "budget", "message"],
    "submitLabel": "Send Message"
  },
  "interactions": {
    "submit": { "action": "submitForm", "animation": "shake" }
  }
}
```

#### Calendar Card

```json
{
  "id": "contact-calendar",
  "type": "GlassCard",
  "position": [0.8, 1.0, -0.3],
  "rotation": [0, -0.2, 0],
  "size": { "width": 0.6, "height": 0.5, "thickness": 0.025 },
  "content": {
    "icon": "calendar",
    "label": "Schedule a Call",
    "description": "Book a 30-minute discovery call"
  },
  "interactions": {
    "click": { "action": "openExternal", "url": "calendly.com/enkayel" }
  }
}
```

---

## Camera Splines

### Home → Consulting

```json
{
  "id": "home-to-consulting",
  "type": "CubicBezierCurve3",
  "points": {
    "start": [-3, 1.5, 3],
    "control1": [-1, 2.0, 2],
    "control2": [-0.5, 1.8, 1],
    "end": [0, 1.5, 3]
  },
  "duration": 900,
  "easing": "easeInOutCubic"
}
```

### Home → Software

```json
{
  "id": "home-to-software",
  "points": {
    "start": [-3, 1.5, 3],
    "control1": [-1, 2.2, 2.5],
    "control2": [0, 2.0, 3],
    "end": [0, 1.8, 3.5]
  },
  "duration": 900,
  "easing": "easeInOutCubic"
}
```

### Home → Construction

```json
{
  "id": "home-to-construction",
  "points": {
    "start": [-3, 1.5, 3],
    "control1": [-1, 2.0, 2.5],
    "control2": [0, 1.8, 2.8],
    "end": [0, 1.6, 3.2]
  },
  "duration": 900,
  "easing": "easeInOutCubic"
}
```

### Any → Contact

```json
{
  "id": "to-contact",
  "duration": 800,
  "easing": "easeInOutCubic",
  "end": [0, 1.4, 2.8]
}
```

### Back Navigation

For all "back" transitions, reverse the control points and use `easeOutCubic`.

---

## Interaction Specifications

### Card Hover

```json
{
  "trigger": "pointerEnter",
  "animation": {
    "scale": { "to": 1.03, "duration": 120, "easing": "spring" },
    "fresnelBoost": { "to": 0.06, "duration": 120 },
    "rotation": { "y": "+0.02", "duration": 200 }
  }
}
```

### Card Press

```json
{
  "trigger": "pointerDown",
  "animation": {
    "scale": { "to": 0.98, "duration": 80, "easing": "linear" },
    "refractionStrength": { "to": "+0.04" }
  }
}
```

### Card Release

```json
{
  "trigger": "pointerUp",
  "animation": {
    "scale": { "to": 1.0, "duration": 220, "easing": "spring", "overshoot": 1.02 }
  }
}
```

### Card Click (Navigate)

```json
{
  "trigger": "click",
  "sequence": [
    { "action": "animateScale", "to": 0.95, "duration": 100 },
    { "action": "startCameraTransition", "target": "node" },
    { "action": "animateScale", "to": 1.0, "duration": 200 }
  ]
}
```

### Card Click (Expand Modal)

```json
{
  "trigger": "click",
  "sequence": [
    { "action": "animateScale", "to": 1.1, "duration": 150 },
    { "action": "animatePosition", "towardCamera": 0.3, "duration": 300 },
    { "action": "morphToModal", "duration": 400 },
    { "action": "fadeInContent", "duration": 200 }
  ]
}
```

---

## Idle Animations

### Card Oscillation

```json
{
  "type": "oscillation",
  "property": "position.y",
  "amplitude": 0.03,
  "frequency": 0.4,
  "phase": "random"
}
```

### Card Rotation Wobble

```json
{
  "type": "oscillation",
  "property": "rotation.y",
  "amplitude": 0.02,
  "frequency": 0.3,
  "phase": "random"
}
```

### Floating Logo Spin

```json
{
  "type": "continuous",
  "property": "rotation.y",
  "speed": 0.1
}
```

---

## Material Variations by Node

### Home Hub

```json
{
  "material": {
    "transmission": 0.92,
    "roughness": 0.12,
    "tint": "rgba(255,255,255,0.08)"
  }
}
```

### Consulting Room

```json
{
  "material": {
    "transmission": 0.90,
    "roughness": 0.14,
    "tint": "rgba(200,220,255,0.06)"
  }
}
```

### Software Room

```json
{
  "material": {
    "transmission": 0.88,
    "roughness": 0.10,
    "tint": "rgba(180,200,255,0.08)"
  }
}
```

### Construction Room

```json
{
  "material": {
    "transmission": 0.90,
    "roughness": 0.15,
    "tint": "rgba(220,200,180,0.06)"
  }
}
```

### Contact Node

```json
{
  "material": {
    "transmission": 0.85,
    "roughness": 0.18,
    "tint": "rgba(255,255,255,0.10)"
  }
}
```

---

## Implementation Checklist

### Per Node

- [ ] Camera position configured
- [ ] All cards positioned per layout
- [ ] Idle animations applied
- [ ] Hover states working
- [ ] Click navigation functional
- [ ] Content connected to mock data
- [ ] Material variations applied

### Global

- [ ] All camera splines defined
- [ ] Navigation graph complete
- [ ] URL routing working
- [ ] Modal system functional
- [ ] Accessibility fallbacks ready

---

*This MVP layout blueprint provides exact specifications for implementing the 3D scene. Use these coordinates and configurations directly in Blender and R3F.*
