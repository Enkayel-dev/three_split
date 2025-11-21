# Documentation Index

## Enkayel Studios - Liquid Glass 3D Portfolio

Welcome to the comprehensive knowledge base for the Liquid Glass 3D website project. This documentation set provides everything needed to successfully implement the MVP.

---

## Quick Start

1. Read the [README](../README.md) for project overview
2. Review [Creative Direction](./CREATIVE_DIRECTION.md) to understand the design vision
3. Study [Technical Architecture](./TECHNICAL_ARCHITECTURE.md) for system design
4. Follow [Implementation Plan](./IMPLEMENTATION_PLAN.md) for phased development

---

## Documentation Map

### Design & Vision

| Document | Description |
|----------|-------------|
| [Creative Direction](./CREATIVE_DIRECTION.md) | Design manifesto, brand guidelines, visual identity |
| [Information Architecture](./INFORMATION_ARCHITECTURE.md) | Site structure, navigation, spatial layout |
| [MVP Layout](./MVP_LAYOUT.md) | 3D scene blueprint with exact coordinates |

### Technical Specifications

| Document | Description |
|----------|-------------|
| [Technical Architecture](./TECHNICAL_ARCHITECTURE.md) | System architecture, modules, data flow |
| [Component Library](./COMPONENT_LIBRARY.md) | 3D UI component specifications |
| [Shader Specification](./SHADER_SPECIFICATION.md) | Liquid Glass material system |
| [Animation System](./ANIMATION_SYSTEM.md) | Motion design, timings, springs |
| [Asset Pipeline](./ASSET_PIPELINE.md) | Blender → Web workflow |

### Quality & Standards

| Document | Description |
|----------|-------------|
| [Accessibility](./ACCESSIBILITY.md) | A11y requirements, fallbacks |
| [Performance](./PERFORMANCE.md) | Optimization strategies, budgets |

### Planning & Content

| Document | Description |
|----------|-------------|
| [Implementation Plan](./IMPLEMENTATION_PLAN.md) | Phased development roadmap |
| [Mock Data](./MOCK_DATA.md) | Portfolio content, sample data |

---

## Reading Order

### For Project Managers

1. Creative Direction
2. Implementation Plan
3. Information Architecture
4. Mock Data

### For Designers

1. Creative Direction
2. Component Library
3. Animation System
4. MVP Layout
5. Accessibility

### For Frontend Developers

1. Technical Architecture
2. Component Library
3. Shader Specification
4. Animation System
5. Performance

### For 3D Artists

1. Creative Direction
2. Asset Pipeline
3. Component Library
4. MVP Layout

---

## Key Concepts

### What is Liquid Glass?

Apple's Liquid Glass is a system material featuring:
- Real-time screen-space refraction
- Dynamic blur (frosted glass)
- Fresnel edge highlights
- Motion-driven behavior
- Depth-aware effects

### The 3D Website Concept

Instead of traditional 2D web pages:
- UI elements are 3D objects in space
- Navigation moves the camera between "nodes"
- Glass panels float and interact physically
- Motion communicates state changes

### Technology Stack

| Layer | Tech |
|-------|------|
| Framework | React |
| 3D Engine | React Three Fiber / Three.js |
| Animation | react-spring |
| Shaders | Custom GLSL |
| Build | Vite |
| Modeling | Blender |

---

## Quick Reference

### Material Parameters

```
IOR: 1.45
Transmission: 0.92
Roughness: 0.12
Fresnel Power: 2.5
Refraction Strength: 0.02
```

### Animation Timings

```
Fast: 120ms
Medium: 280ms
Slow: 600ms
Page Transit: 900ms
```

### Spring Config

```javascript
{ tension: 120, friction: 14 } // Gentle
{ tension: 180, friction: 12 } // Snappy
```

### Standard Dimensions

```
Card: 0.9m × 0.5m × 0.03m
Button: 0.2m × 0.06m × 0.04m
Hero Panel: 2.0m × 1.2m × 0.04m
```

---

## Document Versions

| Document | Version | Last Updated |
|----------|---------|--------------|
| All documents | 1.0.0 | Initial release |

---

## Contributing to Documentation

When updating documentation:
1. Maintain consistent formatting
2. Update version numbers
3. Cross-reference related documents
4. Keep code examples current
5. Test all links

---

*This index provides navigation through the complete knowledge base. Start with the documents relevant to your role.*
