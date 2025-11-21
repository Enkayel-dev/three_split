# Asset Pipeline & Blender → Web Standards

## Overview

This document defines the complete workflow for creating 3D assets in Blender and exporting them for use in the Three.js/React Three Fiber website. Following these standards ensures consistency, optimal performance, and seamless integration.

---

## Modeling Guidelines

### Unit System

| Setting | Value | Notes |
|---------|-------|-------|
| Unit Scale | Meters | 1 Blender unit = 1 meter |
| Grid Scale | 0.1m | For precise alignment |
| Clip Start | 0.01m | Camera near plane |
| Clip End | 100m | Camera far plane |

**Configure in Blender**: Scene Properties → Units → Length: Meters

### Geometry Standards

| Parameter | Guideline |
|-----------|-----------|
| Polycount (Cards) | < 500 triangles |
| Polycount (Buttons) | < 300 triangles |
| Polycount (Modals) | < 1000 triangles |
| Polycount (Scene Total) | < 50,000 visible |
| Subdivision Level | 1-2 max |
| Edge Bevels | 0.005 - 0.015m |
| Thickness | 0.015 - 0.05m |

### Topology Rules

1. **Quads preferred** - No n-gons, minimize triangles
2. **Even distribution** - Avoid dense/sparse areas
3. **Clean normals** - No inverted faces
4. **No overlapping** - Vertices or faces
5. **Manifold meshes** - Watertight where appropriate

### Shape Guidelines for Liquid Glass

| Element | Shape Recommendations |
|---------|----------------------|
| Cards | Rounded rectangle, slight bevel, solid thickness |
| Buttons | Pill/capsule shape, high corner radius |
| Panels | Flat with rounded corners, minimal curvature |
| Icons | Circular or square with high radius |

---

## Standard Dimensions

### UI Components

| Component | Width | Height | Thickness |
|-----------|-------|--------|-----------|
| Glass Card | 0.9m | 0.5-0.6m | 0.03m |
| Navigation Card | 0.8m | 0.5m | 0.025m |
| Glass Button | 0.15-0.3m | 0.05-0.08m | 0.03-0.06m |
| Hero Panel | 2.0m | 1.2m | 0.04m |
| Modal Panel | 1.5-2.5m | 1.0-1.8m | 0.04m |
| Form Input | 0.4-0.8m | 0.06m | 0.008m |
| Toolbar | 2.0-3.0m | 0.08-0.12m | 0.015m |

### Corner Radii

| Component | Corner Radius |
|-----------|---------------|
| Cards | 0.04m |
| Buttons | 50% of height (pill) |
| Panels | 0.03-0.05m |
| Inputs | 0.01m |

---

## Pivot Points & Origins

### Placement Rules

| Component | Pivot Location |
|-----------|----------------|
| Cards | Center-center |
| Buttons | Center-center |
| Modals | Center-center |
| Toolbars | Center-bottom |
| Icons | Center-center |

### Setting Origin in Blender

```
1. Select object
2. Object → Set Origin → Origin to Geometry (center)
   OR
3. Object → Set Origin → Origin to 3D Cursor (for specific placement)
```

### Why This Matters

- Consistent pivot points enable predictable scaling
- Center pivots simplify positioning in R3F
- Animations scale/rotate around expected point

---

## Material Setup (Blender Preview)

Use Blender's Principled BSDF for preview (final materials are WebGL):

### Liquid Glass Preview Material

```
Principled BSDF:
├── Base Color: (0.95, 0.95, 0.97)
├── Metallic: 0.0
├── Roughness: 0.1 - 0.15
├── IOR: 1.45
├── Transmission: 0.92
├── Alpha: 1.0 (controlled by transmission)
└── Clearcoat: 0.1
```

### Viewport Settings

- Use Rendered or Material Preview mode
- Enable Screen Space Reflections
- Set world background to match production environment

---

## Normal Maps

### When to Bake Normals

- Complex surface detail that would increase polycount
- Subtle curvature enhancement
- Imperfections or texture

### Baking Settings

| Setting | Value |
|---------|-------|
| Resolution | 1024x1024 (cards), 512x512 (buttons) |
| Format | PNG, 16-bit |
| Space | Tangent space |
| Margin | 16px |

### Export Settings

```
Image → Save As:
├── Format: PNG
├── Color Depth: 16
└── Compression: 0
```

---

## GLTF Export Configuration

### Export Settings

```
File → Export → glTF 2.0 (.glb/.gltf)

Format:
├── Format: glTF Binary (.glb) [RECOMMENDED]
├── Or: glTF Embedded (.gltf)

Include:
├── ☑ Selected Objects (if exporting specific items)
├── ☑ Custom Properties
├── ☑ Cameras (if needed)
├── ☐ Punctual Lights (handle in code)

Transform:
├── ☑ +Y Up
├── ☑ +Z Forward
├── ☐ Apply Modifiers (apply manually first)

Geometry:
├── ☑ Apply Modifiers
├── ☑ UVs
├── ☑ Normals
├── ☑ Tangents [IMPORTANT for normal maps]
├── ☐ Vertex Colors (unless needed)
├── ☐ Loose Edges
├── ☐ Loose Points

Animation:
├── ☐ Animations (unless needed)

Compression:
├── ☑ Draco mesh compression [RECOMMENDED]
├── Compression Level: 6
├── Quantization Position: 14
├── Quantization Normal: 10
├── Quantization Tex Coord: 12
```

### Export Checklist

- [ ] Applied all modifiers
- [ ] Applied scale (Ctrl+A → Scale)
- [ ] Applied rotation (Ctrl+A → Rotation)
- [ ] Checked normals (Edit Mode → Mesh → Normals → Recalculate Outside)
- [ ] Named objects clearly
- [ ] Set correct origins
- [ ] Added custom properties (extras)

---

## Naming Conventions

### Objects

```
{component}_{variant}_{version}

Examples:
- card_standard_v1
- button_primary_v1
- modal_form_v1
- icon_consulting_v1
```

### Materials

```
mat_{component}_{variant}

Examples:
- mat_glass_standard
- mat_glass_dark
- mat_glass_contrast
```

### Textures

```
tex_{component}_{type}_{resolution}

Examples:
- tex_card_normal_1024
- tex_button_roughness_512
```

---

## Custom Properties (Extras)

Add metadata to objects for runtime use:

### In Blender

```
Object Properties → Custom Properties → Add

componentType: "GlassCard"
interactable: true
initialState: "idle"
variant: "light"
```

### Exported JSON Structure

```json
{
  "name": "card_standard_v1",
  "extras": {
    "componentType": "GlassCard",
    "interactable": true,
    "initialState": "idle",
    "variant": "light"
  }
}
```

### Accessing in Three.js

```typescript
gltf.scene.traverse((node) => {
  if (node.userData.componentType === 'GlassCard') {
    // Apply glass material
    // Register for interaction
  }
});
```

---

## LOD (Level of Detail) System

### When to Create LODs

- Objects visible at multiple distances
- Complex geometry that impacts performance
- Mobile optimization

### LOD Levels

| Level | Distance | Polycount | Use Case |
|-------|----------|-----------|----------|
| LOD0 | 0 - 2m | 100% | Full detail |
| LOD1 | 2 - 5m | 50% | Reduced detail |
| LOD2 | 5m+ | 25% or billboard | Minimal/impostor |

### Naming for LODs

```
card_standard_v1_LOD0
card_standard_v1_LOD1
card_standard_v1_LOD2
```

### Export as Separate Files or Collections

Option A: Separate GLB files per LOD
Option B: Single GLB with LOD objects as children

---

## Texture Guidelines

### Resolution Standards

| Use Case | Resolution | Notes |
|----------|------------|-------|
| Normal maps (large) | 1024x1024 | Cards, panels |
| Normal maps (small) | 512x512 | Buttons, icons |
| Environment (HDRI) | 1024x512 | Downsample for web |
| UI textures | 256x256 - 512x512 | As needed |

### Format Recommendations

| Type | Format | Notes |
|------|--------|-------|
| Normal maps | PNG 16-bit | Lossless |
| Diffuse/Color | JPEG or WebP | Lossy OK |
| Alpha/Masks | PNG 8-bit | Lossless |
| HDRI | HDR or EXR → convert to RGBE | |

### Compression for Web

Use KTX2 with Basis Universal for runtime:

```bash
# Using toktx tool
toktx --genmipmap --bcmp output.ktx2 input.png
```

---

## Folder Structure

### Blender Project

```
blender/
├── components/
│   ├── cards/
│   │   ├── card_standard.blend
│   │   └── card_hero.blend
│   ├── buttons/
│   │   └── button_primary.blend
│   └── panels/
│       └── modal_form.blend
├── scenes/
│   ├── home_hub.blend
│   └── consulting_room.blend
├── textures/
│   ├── normals/
│   └── environment/
└── exports/
    ├── models/
    └── textures/
```

### Web Project

```
assets/
├── models/
│   ├── components/
│   │   ├── card_standard_v1.glb
│   │   └── button_primary_v1.glb
│   └── scenes/
│       └── home_hub.glb
├── textures/
│   ├── normals/
│   │   └── tex_card_normal_1024.ktx2
│   └── environment/
│       └── studio_small.hdr
└── fonts/
    └── inter-variable.woff2
```

---

## Version Control

### What to Track

```
.gitignore (for Blender):
# Ignore Blender backups
*.blend1
*.blend2

# Track source files
*.blend
*.png
*.hdr

# Track exports
*.glb
*.gltf
```

### Versioning Strategy

- Increment version suffix for breaking changes: `v1` → `v2`
- Use branches for experimental work
- Tag releases with asset versions

---

## Quality Assurance Checklist

### Before Export

- [ ] All modifiers applied
- [ ] Transforms applied (location, rotation, scale)
- [ ] Normals pointing outward
- [ ] No duplicate vertices
- [ ] Origins set correctly
- [ ] Custom properties added
- [ ] Materials assigned (for preview)

### After Export

- [ ] File size reasonable (< 500KB per component)
- [ ] Opens in glTF Viewer without errors
- [ ] Geometry appears correct
- [ ] Custom properties preserved
- [ ] Normals/tangents exported

### In Application

- [ ] Model loads without errors
- [ ] Scale matches expectations
- [ ] Materials apply correctly
- [ ] Interactions work
- [ ] Performance within budget

---

## Common Issues & Solutions

### Issue: Inverted normals

**Solution**: Edit Mode → Mesh → Normals → Recalculate Outside

### Issue: Missing tangents

**Solution**: Enable "Tangents" in GLTF export settings

### Issue: Incorrect scale

**Solution**: Apply scale in Blender (Ctrl+A → Scale)

### Issue: Large file size

**Solution**:
- Enable Draco compression
- Reduce polygon count
- Optimize textures

### Issue: Materials not appearing

**Solution**: Materials are defined in code, not GLTF (by design)

---

## Reference Files

### Blender Template

A template `.blend` file should include:
- Correct unit settings
- Reference grid at standard scale
- Example component with correct setup
- Preview material

### Export Preset

Save a GLTF export preset with standard settings for consistency.

---

*This asset pipeline document ensures all 3D content is created and exported consistently. Follow these standards for every asset.*
