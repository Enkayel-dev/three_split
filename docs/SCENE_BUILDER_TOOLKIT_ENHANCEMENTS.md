# Scene Builder Toolkit Enhancements

## Overview

This document extends the Dynamic Scene Builder Implementation Plan with higher-level abstractions that transform the low-level 3D engine API into a comprehensive scene builder toolkit suitable for remote construction via Claude Desktop.

## Critical Gap Analysis

### Current Plan Provides:
- ✅ Low-level scene definition schema
- ✅ Persistence and save/load
- ✅ Object CRUD operations
- ✅ Background system

### Missing from Current Plan:
- ❌ Spatial reasoning tools (I can't "see" while building)
- ❌ Object relationships and constraints
- ❌ Undo/redo and staging system
- ❌ Animation sequencing and choreography
- ❌ Material presets and templates
- ❌ Batch operations for efficiency
- ❌ Layout patterns and templates
- ❌ Advanced querying and discovery
- ❌ Validation and error prevention
- ❌ Visual feedback mechanisms

## Enhanced Implementation Phases

---

## Phase 7: Spatial Reasoning & Visualization Tools

**Goal**: Enable Claude to "see" and reason about the scene spatially without visual access

### Problem Statement
When building remotely, Claude cannot:
- Visualize object positions in 3D space
- Understand spatial relationships
- Verify that layouts look correct
- Reason about coordinates without reference points

### Files to Create

#### Core Spatial System
- `src/systems/spatial/SpatialAnalyzer.ts` - Analyzes scene geometry and relationships
- `src/systems/spatial/DistanceMeasurement.ts` - Measure distances and angles
- `src/systems/spatial/ViewportCalculator.ts` - Calculate what's visible from camera
- `src/systems/spatial/BoundsCalculator.ts` - Calculate object bounding boxes
- `src/systems/spatial/CollisionDetector.ts` - Detect overlapping objects
- `src/systems/spatial/index.ts` - Exports

#### Visual Debug Helpers
- `src/components/debug/DebugGrid.tsx` - Spatial reference grid with labels
- `src/components/debug/DebugAxes.tsx` - World/local axes visualizer
- `src/components/debug/DebugBounds.tsx` - Bounding box renderer
- `src/components/debug/DebugRay.tsx` - Ray visualizer for measurements
- `src/components/debug/index.ts` - Exports

### MCP Tools

#### 1. `measure_distance`
```typescript
{
  name: 'measure_distance',
  description: 'Measure the distance between two objects or positions in 3D space',
  inputSchema: {
    type: 'object',
    properties: {
      from: {
        oneOf: [
          { type: 'string', description: 'Object ID' },
          { type: 'array', items: { type: 'number' }, description: '[x, y, z] position' }
        ]
      },
      to: {
        oneOf: [
          { type: 'string', description: 'Object ID' },
          { type: 'array', items: { type: 'number' }, description: '[x, y, z] position' }
        ]
      },
      units: {
        type: 'string',
        enum: ['meters', 'world_units'],
        default: 'world_units'
      }
    },
    required: ['from', 'to']
  }
}

// Example Response:
{
  distance: 3.5,
  units: 'world_units',
  vector: [2.1, 0.8, -1.2],
  angle: {
    horizontal: 45,  // degrees from Z axis
    vertical: 12     // degrees from XZ plane
  }
}
```

#### 2. `get_viewport_bounds`
```typescript
{
  name: 'get_viewport_bounds',
  description: 'Get the boundaries of what is visible from the current camera position',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      cameraPosition: {
        type: 'array',
        items: { type: 'number' },
        description: 'Optional override camera position'
      }
    },
    required: ['sceneId']
  }
}

// Example Response:
{
  frustum: {
    near: 0.1,
    far: 100,
    left: -3.2,
    right: 3.2,
    top: 2.4,
    bottom: -2.4
  },
  visibleObjects: [
    { id: 'card1', percentageVisible: 100, inFocus: true },
    { id: 'card2', percentageVisible: 45, inFocus: false },
    { id: 'panel1', percentageVisible: 0, inFocus: false, reason: 'behind_camera' }
  ],
  center: [0, 1, 0],  // Point camera is looking at
  worldBounds: {
    min: [-5, -2, -5],
    max: [5, 4, 5]
  }
}
```

#### 3. `align_objects`
```typescript
{
  name: 'align_objects',
  description: 'Align multiple objects along a specified axis or pattern',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      objectIds: {
        type: 'array',
        items: { type: 'string' }
      },
      alignment: {
        type: 'object',
        properties: {
          axis: {
            type: 'string',
            enum: ['x', 'y', 'z'],
            description: 'Which axis to align on'
          },
          reference: {
            type: 'string',
            enum: ['first', 'last', 'center', 'average'],
            description: 'Which object to use as reference'
          },
          spacing: {
            type: 'number',
            description: 'Distance between objects after alignment'
          }
        },
        required: ['axis']
      },
      save: { type: 'boolean', default: false }
    },
    required: ['sceneId', 'objectIds', 'alignment']
  }
}

// Example Usage:
align_objects({
  sceneId: 'home',
  objectIds: ['card1', 'card2', 'card3'],
  alignment: {
    axis: 'y',
    reference: 'center',  // Align all to average Y position
    spacing: 0           // No spacing change
  }
})
```

#### 4. `get_spatial_grid`
```typescript
{
  name: 'get_spatial_grid',
  description: 'Get a text representation of the scene layout from different angles',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      view: {
        type: 'string',
        enum: ['top', 'front', 'side', 'perspective'],
        default: 'top'
      },
      showAxes: { type: 'boolean', default: true },
      showBounds: { type: 'boolean', default: false },
      gridSize: { type: 'number', default: 10 }
    },
    required: ['sceneId']
  }
}

// Example Response (top view):
{
  view: 'top',
  asciiGrid: `
    -5  -4  -3  -2  -1   0   1   2   3   4   5
 5  .   .   .   .   .   .   .   .   .   .   .
 4  .   .   .   .   .   .   .   .   .   .   .
 3  .   .   .   .   .   .   .   .   .   .   .
 2  .   .   .   .   .   @   .   .   .   .   .  <- logo
 1  .   .   .   .   .   #   .   .   .   .   .  <- panel
 0  .   C   .   .   .   S   .   .   .   K   .  <- cards (C=consulting, S=software, K=construction)
-1  .   .   .   .   .   .   .   .   .   .   .
-2  .   .   .   .   .   .   .   .   .   .   .
    -5  -4  -3  -2  -1   0   1   2   3   4   5
  `,
  objects: [
    { id: 'consulting_card', symbol: 'C', position: [-1.5, 0.8, -1.2] },
    { id: 'software_card', symbol: 'S', position: [0, 0.8, -1.2] },
    { id: 'construction_card', symbol: 'K', position: [1.5, 0.8, -1.2] },
    { id: 'hero_panel', symbol: '#', position: [0, 1.2, 0] },
    { id: 'floating_logo', symbol: '@', position: [0, 2, -0.5] }
  ]
}
```

#### 5. `get_object_relationships`
```typescript
{
  name: 'get_object_relationships',
  description: 'Analyze spatial relationships between objects',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      objectId: { type: 'string' },
      maxDistance: { type: 'number', description: 'Only include objects within this distance' }
    },
    required: ['sceneId', 'objectId']
  }
}

// Example Response:
{
  objectId: 'software_card',
  position: [0, 0.8, -1.2],
  nearbyObjects: [
    {
      id: 'consulting_card',
      distance: 1.5,
      direction: 'left',
      relativePosition: [-1.5, 0, 0],
      alignment: { sameY: true, sameZ: true }
    },
    {
      id: 'construction_card',
      distance: 1.5,
      direction: 'right',
      relativePosition: [1.5, 0, 0],
      alignment: { sameY: true, sameZ: true }
    },
    {
      id: 'hero_panel',
      distance: 1.44,
      direction: 'above_forward',
      relativePosition: [0, 0.4, 1.2],
      alignment: { sameX: true }
    }
  ],
  inViewport: true,
  occludedBy: []
}
```

### Implementation Details

**SpatialAnalyzer.ts**:
```typescript
export class SpatialAnalyzer {
  private scene: SceneDefinition

  measureDistance(
    from: string | [number, number, number],
    to: string | [number, number, number]
  ): MeasurementResult {
    const fromPos = this.resolvePosition(from)
    const toPos = this.resolvePosition(to)

    const vector = [
      toPos[0] - fromPos[0],
      toPos[1] - fromPos[1],
      toPos[2] - fromPos[2]
    ]

    const distance = Math.sqrt(
      vector[0] ** 2 + vector[1] ** 2 + vector[2] ** 2
    )

    const horizontalAngle = Math.atan2(vector[0], vector[2]) * (180 / Math.PI)
    const verticalAngle = Math.atan2(
      vector[1],
      Math.sqrt(vector[0] ** 2 + vector[2] ** 2)
    ) * (180 / Math.PI)

    return {
      distance,
      vector,
      angle: { horizontal: horizontalAngle, vertical: verticalAngle }
    }
  }

  getViewportBounds(cameraPos: [number, number, number], cameraTarget: [number, number, number]): ViewportBounds {
    // Calculate frustum
    // Determine visible objects
    // Calculate world bounds
    // Return comprehensive viewport info
  }

  generateAsciiGrid(view: 'top' | 'front' | 'side', gridSize: number): string {
    // Project objects onto 2D plane
    // Create ASCII representation
    // Add labels and legends
  }

  analyzeRelationships(objectId: string, maxDistance?: number): RelationshipAnalysis {
    // Find nearby objects
    // Calculate relative positions
    // Determine alignment
    // Check occlusion
  }
}
```

---

## Phase 8: Layout Templates & Object Relationships

**Goal**: Provide high-level layout patterns and object relationship constraints

### Problem Statement
Current system requires manual coordinate calculation for common patterns:
- Circular arrangements
- Grid layouts
- Linear sequences
- Can't maintain relationships (e.g., "keep this label above that card")

### Files to Create

#### Layout System
- `src/systems/layout/LayoutEngine.ts` - Main layout calculator
- `src/systems/layout/patterns/CircularLayout.ts` - Circular arrangement
- `src/systems/layout/patterns/GridLayout.ts` - Grid arrangement
- `src/systems/layout/patterns/LinearLayout.ts` - Line arrangement
- `src/systems/layout/patterns/SpiralLayout.ts` - Spiral arrangement
- `src/systems/layout/patterns/RadialLayout.ts` - Radial (hub and spoke)
- `src/systems/layout/constraints/` - Constraint system
  - `PositionConstraint.ts` - Position relative to another object
  - `AlignmentConstraint.ts` - Maintain alignment
  - `DistanceConstraint.ts` - Maintain distance
  - `LookAtConstraint.ts` - Always face target
- `src/systems/layout/index.ts` - Exports

### MCP Tools

#### 1. `create_layout`
```typescript
{
  name: 'create_layout',
  description: 'Create objects in a predefined layout pattern',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      pattern: {
        type: 'string',
        enum: ['circular', 'grid', 'line', 'spiral', 'radial'],
        description: 'Layout pattern to use'
      },
      objects: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['GlassButton', 'GlassCard', 'GlassPanel', 'mesh'] },
            props: { type: 'object', description: 'Component-specific properties' }
          }
        },
        description: 'Objects to create and layout'
      },
      layoutParams: {
        type: 'object',
        properties: {
          // Circular
          radius: { type: 'number' },
          centerPosition: { type: 'array', items: { type: 'number' } },
          startAngle: { type: 'number', default: 0 },
          rotateToFaceCenter: { type: 'boolean', default: false },

          // Grid
          columns: { type: 'number' },
          rows: { type: 'number' },
          spacingX: { type: 'number' },
          spacingZ: { type: 'number' },

          // Line
          axis: { type: 'string', enum: ['x', 'y', 'z'] },
          spacing: { type: 'number' },
          startPosition: { type: 'array', items: { type: 'number' } },

          // Spiral
          revolutions: { type: 'number' },
          radiusGrowth: { type: 'number' },
          heightGrowth: { type: 'number' },

          // Radial (hub and spoke)
          centerObject: { type: 'string', description: 'ID of center object' },
          spokeLength: { type: 'number' },
          spokeAngles: { type: 'array', items: { type: 'number' } }
        }
      },
      save: { type: 'boolean', default: false }
    },
    required: ['sceneId', 'pattern', 'objects', 'layoutParams']
  }
}

// Example: Circular layout
create_layout({
  sceneId: 'home',
  pattern: 'circular',
  objects: [
    { type: 'GlassCard', props: { title: 'Feature 1', subtitle: 'Description' } },
    { type: 'GlassCard', props: { title: 'Feature 2', subtitle: 'Description' } },
    { type: 'GlassCard', props: { title: 'Feature 3', subtitle: 'Description' } },
    { type: 'GlassCard', props: { title: 'Feature 4', subtitle: 'Description' } },
    { type: 'GlassCard', props: { title: 'Feature 5', subtitle: 'Description' } },
    { type: 'GlassCard', props: { title: 'Feature 6', subtitle: 'Description' } }
  ],
  layoutParams: {
    radius: 3,
    centerPosition: [0, 1, 0],
    rotateToFaceCenter: true  // Cards face inward
  },
  save: true
})

// Example: Grid layout
create_layout({
  sceneId: 'software',
  pattern: 'grid',
  objects: [
    { type: 'GlassButton', props: { label: 'Project 1' } },
    { type: 'GlassButton', props: { label: 'Project 2' } },
    { type: 'GlassButton', props: { label: 'Project 3' } },
    { type: 'GlassButton', props: { label: 'Project 4' } },
    { type: 'GlassButton', props: { label: 'Project 5' } },
    { type: 'GlassButton', props: { label: 'Project 6' } }
  ],
  layoutParams: {
    columns: 3,
    rows: 2,
    spacingX: 1.5,
    spacingZ: 1.2,
    centerPosition: [0, 1, -2]
  }
})
```

#### 2. `distribute_objects`
```typescript
{
  name: 'distribute_objects',
  description: 'Redistribute existing objects in a new pattern',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      objectIds: { type: 'array', items: { type: 'string' } },
      pattern: { type: 'string', enum: ['circular', 'grid', 'line', 'spiral'] },
      layoutParams: { type: 'object' },
      save: { type: 'boolean', default: false }
    },
    required: ['sceneId', 'objectIds', 'pattern', 'layoutParams']
  }
}

// Example: Rearrange existing cards
distribute_objects({
  sceneId: 'home',
  objectIds: ['card1', 'card2', 'card3', 'card4'],
  pattern: 'line',
  layoutParams: {
    axis: 'x',
    spacing: 2,
    startPosition: [-3, 1, 0]
  }
})
```

#### 3. `attach_to_parent`
```typescript
{
  name: 'attach_to_parent',
  description: 'Create a parent-child relationship with position constraint',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      childId: { type: 'string' },
      parentId: { type: 'string' },
      offset: {
        type: 'array',
        items: { type: 'number' },
        description: 'Offset from parent position [x, y, z]'
      },
      maintainWorldPosition: {
        type: 'boolean',
        default: false,
        description: 'If true, keeps current position but follows parent'
      },
      save: { type: 'boolean', default: false }
    },
    required: ['sceneId', 'childId', 'parentId']
  }
}

// Example: Attach label above card
attach_to_parent({
  sceneId: 'home',
  childId: 'card_label',
  parentId: 'hero_card',
  offset: [0, 0.8, 0]  // 0.8 units above
})
```

#### 4. `apply_grid_layout`
```typescript
{
  name: 'apply_grid_layout',
  description: 'Arrange existing objects in a grid',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      objectIds: { type: 'array', items: { type: 'string' } },
      columns: { type: 'number' },
      spacing: {
        type: 'object',
        properties: {
          x: { type: 'number' },
          z: { type: 'number' }
        }
      },
      centerAt: {
        type: 'array',
        items: { type: 'number' },
        description: 'Position of grid center'
      },
      save: { type: 'boolean', default: false }
    },
    required: ['sceneId', 'objectIds', 'columns', 'spacing']
  }
}
```

#### 5. `add_constraint`
```typescript
{
  name: 'add_constraint',
  description: 'Add a positional or rotational constraint to an object',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      objectId: { type: 'string' },
      constraint: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['lookAt', 'maintainDistance', 'alignWith', 'followPath']
          },
          target: { type: 'string', description: 'Target object ID or position' },
          params: { type: 'object' }
        },
        required: ['type']
      },
      save: { type: 'boolean', default: false }
    },
    required: ['sceneId', 'objectId', 'constraint']
  }
}

// Example: Make object always face camera
add_constraint({
  sceneId: 'home',
  objectId: 'info_panel',
  constraint: {
    type: 'lookAt',
    target: 'camera',
    params: { axis: 'y' }  // Only rotate around Y axis
  }
})

// Example: Maintain distance from another object
add_constraint({
  sceneId: 'home',
  objectId: 'satellite_card',
  constraint: {
    type: 'maintainDistance',
    target: 'hero_card',
    params: { distance: 2, lockY: true }
  }
})
```

### Implementation Details

**LayoutEngine.ts**:
```typescript
export class LayoutEngine {
  calculateCircularLayout(
    count: number,
    radius: number,
    centerPosition: [number, number, number],
    startAngle: number = 0,
    rotateToFaceCenter: boolean = false
  ): Array<{ position: [number, number, number]; rotation: [number, number, number] }> {
    const angleStep = (Math.PI * 2) / count
    const positions = []

    for (let i = 0; i < count; i++) {
      const angle = startAngle + angleStep * i
      const x = centerPosition[0] + Math.cos(angle) * radius
      const z = centerPosition[2] + Math.sin(angle) * radius
      const y = centerPosition[1]

      const rotation = rotateToFaceCenter
        ? [0, -angle + Math.PI, 0]  // Face center
        : [0, 0, 0]

      positions.push({ position: [x, y, z], rotation })
    }

    return positions
  }

  calculateGridLayout(
    count: number,
    columns: number,
    spacingX: number,
    spacingZ: number,
    centerPosition: [number, number, number]
  ): Array<{ position: [number, number, number] }> {
    const rows = Math.ceil(count / columns)
    const positions = []

    // Calculate starting position to center grid
    const totalWidth = (columns - 1) * spacingX
    const totalDepth = (rows - 1) * spacingZ
    const startX = centerPosition[0] - totalWidth / 2
    const startZ = centerPosition[2] - totalDepth / 2

    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / columns)
      const col = i % columns

      positions.push({
        position: [
          startX + col * spacingX,
          centerPosition[1],
          startZ + row * spacingZ
        ]
      })
    }

    return positions
  }

  calculateSpiralLayout(
    count: number,
    revolutions: number,
    radiusGrowth: number,
    heightGrowth: number,
    centerPosition: [number, number, number]
  ): Array<{ position: [number, number, number] }> {
    const positions = []
    const angleStep = (Math.PI * 2 * revolutions) / count

    for (let i = 0; i < count; i++) {
      const t = i / count
      const angle = angleStep * i
      const radius = radiusGrowth * t
      const height = heightGrowth * t

      positions.push({
        position: [
          centerPosition[0] + Math.cos(angle) * radius,
          centerPosition[1] + height,
          centerPosition[2] + Math.sin(angle) * radius
        ]
      })
    }

    return positions
  }
}
```

---

## Phase 9: Material Presets & Animation Sequencing

**Goal**: Provide reusable material presets and complex animation choreography

### Problem Statement
- No material library - must specify all properties manually every time
- Can't save and reuse successful material combinations
- Can only trigger single animations, not orchestrated sequences
- No way to create entrance/exit sequences

### Files to Create

#### Material Preset System
- `src/systems/materials/MaterialPresets.ts` - Preset definitions and management
- `src/systems/materials/PresetLibrary.ts` - Built-in preset library
- `public/materials/presets/` - JSON preset files
  - `glass.json` - Glass material presets
  - `holographic.json` - Holographic material presets
  - `metallic.json` - Metallic material presets
  - `neon.json` - Neon/glow material presets

#### Animation Sequencing System
- `src/systems/animation/AnimationSequencer.ts` - Timeline and sequencer
- `src/systems/animation/SequenceBuilder.ts` - Fluent API for building sequences
- `src/systems/animation/sequences/` - Preset sequences
  - `entrance.ts` - Entrance animations
  - `exit.ts` - Exit animations
  - `attention.ts` - Attention-grabbing animations
- `src/systems/animation/index.ts` - Exports

### MCP Tools

#### 1. `apply_material_preset`
```typescript
{
  name: 'apply_material_preset',
  description: 'Apply a predefined material preset to an object',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      objectId: { type: 'string' },
      preset: {
        type: 'string',
        description: 'Preset name (e.g., frosted_blue, crystal_clear, holographic_purple)'
      },
      variations: {
        type: 'object',
        description: 'Optional overrides to preset values',
        properties: {
          intensity: { type: 'number', minimum: 0, maximum: 2 },
          tint: { type: 'string', description: 'Color tint override' }
        }
      },
      save: { type: 'boolean', default: false }
    },
    required: ['sceneId', 'objectId', 'preset']
  }
}

// Example Usage:
apply_material_preset({
  sceneId: 'home',
  objectId: 'hero_card',
  preset: 'frosted_blue',
  variations: { intensity: 1.2 }
})
```

#### 2. `list_material_presets`
```typescript
{
  name: 'list_material_presets',
  description: 'List all available material presets',
  inputSchema: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        enum: ['all', 'glass', 'holographic', 'metallic', 'neon', 'custom'],
        default: 'all'
      },
      includeDetails: { type: 'boolean', default: false }
    }
  }
}

// Example Response:
{
  presets: [
    {
      name: 'frosted_blue',
      category: 'glass',
      description: 'Blue tinted frosted glass with subtle glow',
      preview: {
        transmission: 0.9,
        roughness: 0.15,
        color: '#4A90E2',
        emissiveIntensity: 0.2
      }
    },
    {
      name: 'crystal_clear',
      category: 'glass',
      description: 'Ultra-clear glass with high transmission',
      preview: {
        transmission: 0.98,
        roughness: 0.02,
        ior: 1.5,
        clearcoat: 1.0
      }
    },
    {
      name: 'holographic_purple',
      category: 'holographic',
      description: 'Iridescent purple with rainbow reflections',
      preview: {
        metalness: 0.9,
        roughness: 0.1,
        color: '#8B5CF6',
        envMapIntensity: 2.0
      }
    }
  ]
}
```

#### 3. `save_material_as_preset`
```typescript
{
  name: 'save_material_as_preset',
  description: 'Save the current material configuration of an object as a reusable preset',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      objectId: { type: 'string' },
      presetName: { type: 'string' },
      category: { type: 'string' },
      description: { type: 'string' }
    },
    required: ['sceneId', 'objectId', 'presetName']
  }
}
```

#### 4. `create_animation_sequence`
```typescript
{
  name: 'create_animation_sequence',
  description: 'Create a choreographed animation sequence with multiple objects',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      sequenceName: { type: 'string' },
      timeline: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            objectId: { type: 'string' },
            animation: { type: 'string' },
            startTime: { type: 'number', description: 'Start time in milliseconds' },
            duration: { type: 'number', description: 'Duration in milliseconds' },
            easing: { type: 'string', enum: ['linear', 'easeIn', 'easeOut', 'easeInOut', 'bounce'] },
            params: { type: 'object' }
          },
          required: ['objectId', 'animation', 'startTime']
        }
      },
      loop: { type: 'boolean', default: false },
      autoPlay: { type: 'boolean', default: false },
      save: { type: 'boolean', default: false }
    },
    required: ['sceneId', 'sequenceName', 'timeline']
  }
}

// Example: Cascade entrance animation
create_animation_sequence({
  sceneId: 'home',
  sequenceName: 'entrance_cascade',
  timeline: [
    { objectId: 'hero_panel', animation: 'fadeIn', startTime: 0, duration: 600, easing: 'easeOut' },
    { objectId: 'consulting_card', animation: 'slideInFromLeft', startTime: 200, duration: 500, easing: 'easeOut' },
    { objectId: 'software_card', animation: 'fadeIn', startTime: 400, duration: 500, easing: 'easeOut' },
    { objectId: 'construction_card', animation: 'slideInFromRight', startTime: 600, duration: 500, easing: 'easeOut' },
    { objectId: 'floating_logo', animation: 'scaleIn', startTime: 800, duration: 700, easing: 'bounce' }
  ],
  autoPlay: true,
  save: true
})
```

#### 5. `play_animation_sequence`
```typescript
{
  name: 'play_animation_sequence',
  description: 'Play a saved animation sequence',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      sequenceName: { type: 'string' },
      speed: { type: 'number', default: 1.0, description: 'Playback speed multiplier' }
    },
    required: ['sceneId', 'sequenceName']
  }
}
```

#### 6. `list_animation_sequences`
```typescript
{
  name: 'list_animation_sequences',
  description: 'List all saved animation sequences for a scene',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' }
    },
    required: ['sceneId']
  }
}
```

### Material Preset Library

**`public/materials/presets/glass.json`**:
```json
{
  "category": "glass",
  "presets": {
    "frosted_blue": {
      "name": "Frosted Blue",
      "description": "Blue tinted frosted glass with subtle glow",
      "material": {
        "transmission": 0.90,
        "roughness": 0.15,
        "ior": 1.5,
        "color": "#4A90E2",
        "attenuationColor": "#4A90E2",
        "attenuationDistance": 0.5,
        "emissive": "#4A90E2",
        "emissiveIntensity": 0.2,
        "clearcoat": 0.3,
        "thickness": 0.5
      }
    },
    "crystal_clear": {
      "name": "Crystal Clear",
      "description": "Ultra-clear glass with high transmission",
      "material": {
        "transmission": 0.98,
        "roughness": 0.02,
        "ior": 1.5,
        "color": "#FFFFFF",
        "clearcoat": 1.0,
        "envMapIntensity": 1.5
      }
    },
    "aqua_tint": {
      "name": "Aqua Tint",
      "description": "Ocean-inspired aqua glass",
      "material": {
        "transmission": 0.92,
        "roughness": 0.08,
        "ior": 1.33,
        "color": "#00CED1",
        "attenuationColor": "#00CED1",
        "attenuationDistance": 0.3,
        "emissive": "#00CED1",
        "emissiveIntensity": 0.15
      }
    },
    "amber_warm": {
      "name": "Amber Warm",
      "description": "Warm amber-tinted glass",
      "material": {
        "transmission": 0.88,
        "roughness": 0.12,
        "ior": 1.5,
        "color": "#FFA500",
        "attenuationColor": "#FFA500",
        "attenuationDistance": 0.4,
        "emissive": "#FFA500",
        "emissiveIntensity": 0.25
      }
    }
  }
}
```

**`public/materials/presets/holographic.json`**:
```json
{
  "category": "holographic",
  "presets": {
    "holographic_purple": {
      "name": "Holographic Purple",
      "description": "Iridescent purple with rainbow reflections",
      "material": {
        "metalness": 0.9,
        "roughness": 0.1,
        "color": "#8B5CF6",
        "emissive": "#8B5CF6",
        "emissiveIntensity": 0.5,
        "envMapIntensity": 2.0,
        "clearcoat": 1.0,
        "clearcoatRoughness": 0.1
      }
    },
    "neon_pink": {
      "name": "Neon Pink",
      "description": "Bright neon pink with strong glow",
      "material": {
        "transmission": 0.3,
        "roughness": 0.2,
        "color": "#FF1493",
        "emissive": "#FF1493",
        "emissiveIntensity": 1.5,
        "envMapIntensity": 1.0
      }
    }
  }
}
```

---

## Phase 10: Undo/Redo & Staging System

**Goal**: Enable safe experimentation with undo/redo and staging branches

### Problem Statement
- No way to test changes without committing
- Can't undo mistakes easily
- No staging area for experiments
- Recovery requires manual backup restoration

### Files to Create

#### Change History System
- `src/systems/history/ChangeHistory.ts` - Tracks all scene modifications
- `src/systems/history/ChangeStack.ts` - Undo/redo stack implementation
- `src/systems/history/Diff.ts` - Calculate differences between scene states
- `src/systems/history/index.ts` - Exports

#### Staging System
- `src/systems/staging/StagingManager.ts` - Manages staging branches
- `src/systems/staging/BranchManager.ts` - Branch creation and switching
- `src/systems/staging/MergeStrategy.ts` - Merge conflict resolution
- `src/systems/staging/index.ts` - Exports

### MCP Tools

#### 1. `undo_last_change`
```typescript
{
  name: 'undo_last_change',
  description: 'Undo the last N changes to the scene',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      steps: { type: 'number', default: 1, minimum: 1, maximum: 50 }
    },
    required: ['sceneId']
  }
}

// Example Response:
{
  success: true,
  undoneChanges: [
    {
      timestamp: '2025-01-24T10:30:15Z',
      action: 'update_object',
      objectId: 'card1',
      changes: { material: { color: '#FF0000' } }
    }
  ],
  currentState: 'restored'
}
```

#### 2. `redo_change`
```typescript
{
  name: 'redo_change',
  description: 'Redo previously undone changes',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      steps: { type: 'number', default: 1, minimum: 1, maximum: 50 }
    },
    required: ['sceneId']
  }
}
```

#### 3. `get_change_history`
```typescript
{
  name: 'get_change_history',
  description: 'Get the history of changes made to the scene',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      limit: { type: 'number', default: 20, maximum: 100 },
      filter: {
        type: 'object',
        properties: {
          action: { type: 'string' },
          objectId: { type: 'string' },
          since: { type: 'string', description: 'ISO timestamp' }
        }
      }
    },
    required: ['sceneId']
  }
}

// Example Response:
{
  history: [
    {
      id: 'change_1737715815000',
      timestamp: '2025-01-24T10:30:15Z',
      action: 'add_object',
      details: {
        objectId: 'new_card_123',
        type: 'GlassCard',
        position: [1, 1, 0]
      },
      canUndo: true
    },
    {
      id: 'change_1737715810000',
      timestamp: '2025-01-24T10:30:10Z',
      action: 'update_material',
      details: {
        objectId: 'hero_card',
        changes: { color: '#4A90E2', emissiveIntensity: 0.5 }
      },
      canUndo: true
    },
    // ... more entries
  ],
  totalCount: 47,
  canUndo: true,
  canRedo: false
}
```

#### 4. `create_staging_branch`
```typescript
{
  name: 'create_staging_branch',
  description: 'Create a staging branch for experimental changes',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      branchName: { type: 'string' },
      description: { type: 'string' }
    },
    required: ['sceneId', 'branchName']
  }
}

// Example:
create_staging_branch({
  sceneId: 'home',
  branchName: 'experiment_new_layout',
  description: 'Testing circular layout for feature cards'
})
```

#### 5. `list_staging_branches`
```typescript
{
  name: 'list_staging_branches',
  description: 'List all staging branches for a scene',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' }
    },
    required: ['sceneId']
  }
}

// Example Response:
{
  currentBranch: 'main',
  branches: [
    {
      name: 'main',
      description: 'Main scene',
      created: '2025-01-20T10:00:00Z',
      lastModified: '2025-01-24T10:30:15Z',
      changeCount: 47
    },
    {
      name: 'experiment_new_layout',
      description: 'Testing circular layout for feature cards',
      created: '2025-01-24T09:00:00Z',
      lastModified: '2025-01-24T09:15:00Z',
      changeCount: 5,
      branchedFrom: 'main'
    }
  ]
}
```

#### 6. `switch_staging_branch`
```typescript
{
  name: 'switch_staging_branch',
  description: 'Switch to a different staging branch',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      branchName: { type: 'string' },
      saveCurrentChanges: { type: 'boolean', default: true }
    },
    required: ['sceneId', 'branchName']
  }
}
```

#### 7. `merge_staging_branch`
```typescript
{
  name: 'merge_staging_branch',
  description: 'Merge changes from a staging branch into main',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      branchName: { type: 'string' },
      strategy: {
        type: 'string',
        enum: ['merge', 'overwrite', 'selective'],
        default: 'merge'
      },
      deleteAfterMerge: { type: 'boolean', default: false }
    },
    required: ['sceneId', 'branchName']
  }
}
```

#### 8. `preview_changes`
```typescript
{
  name: 'preview_changes',
  description: 'Preview uncommitted changes or compare branches',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      compare: {
        type: 'object',
        properties: {
          from: { type: 'string', description: 'Branch or state to compare from' },
          to: { type: 'string', description: 'Branch or state to compare to' }
        }
      },
      showDiff: { type: 'boolean', default: true }
    },
    required: ['sceneId']
  }
}

// Example Response:
{
  changes: {
    added: [
      { id: 'new_card_123', type: 'GlassCard', position: [1, 1, 0] }
    ],
    removed: [
      { id: 'old_panel_456', type: 'GlassPanel' }
    ],
    modified: [
      {
        id: 'hero_card',
        before: { material: { color: '#FFFFFF' } },
        after: { material: { color: '#4A90E2' } }
      }
    ]
  },
  summary: {
    totalChanges: 3,
    objectsAffected: 3
  }
}
```

#### 9. `commit_changes`
```typescript
{
  name: 'commit_changes',
  description: 'Commit staged changes with a message',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      message: { type: 'string' },
      save: { type: 'boolean', default: true }
    },
    required: ['sceneId', 'message']
  }
}
```

#### 10. `discard_changes`
```typescript
{
  name: 'discard_changes',
  description: 'Discard all uncommitted changes',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      confirm: { type: 'boolean', description: 'Must be true to confirm discard' }
    },
    required: ['sceneId', 'confirm']
  }
}
```

---

## Phase 11: Validation & Visual Feedback

**Goal**: Prevent errors and provide visual feedback for remote building

### Problem Statement
- Easy to make mistakes that break the scene
- No way to know if changes "worked" without user manually checking
- Can't see what I'm building
- No performance warnings

### Files to Create

#### Validation System
- `src/systems/validation/SceneValidator.ts` - Main validation logic
- `src/systems/validation/rules/` - Validation rules
  - `OverlapDetection.ts` - Detect overlapping objects
  - `BoundsChecking.ts` - Check if objects are in viewport
  - `ReferenceValidation.ts` - Validate object references
  - `PerformanceAnalysis.ts` - Check for performance issues
- `src/systems/validation/index.ts` - Exports

#### Visual Feedback System
- `src/systems/feedback/ScreenshotCapture.ts` - Capture scene screenshots
- `src/systems/feedback/DiffVisualizer.ts` - Visual difference highlighting
- `src/systems/feedback/index.ts` - Exports

### MCP Tools

#### 1. `validate_scene`
```typescript
{
  name: 'validate_scene',
  description: 'Validate scene for common issues and errors',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      checks: {
        type: 'array',
        items: {
          type: 'string',
          enum: [
            'overlapping_objects',
            'out_of_bounds',
            'missing_references',
            'invalid_materials',
            'performance',
            'accessibility'
          ]
        },
        default: ['overlapping_objects', 'out_of_bounds', 'missing_references']
      },
      strictMode: { type: 'boolean', default: false }
    },
    required: ['sceneId']
  }
}

// Example Response:
{
  valid: false,
  errors: [
    {
      severity: 'error',
      code: 'MISSING_REFERENCE',
      message: 'Object "card1" references parent "panel_999" which does not exist',
      objectId: 'card1',
      suggestion: 'Remove parent reference or create the missing object'
    }
  ],
  warnings: [
    {
      severity: 'warning',
      code: 'OBJECTS_OVERLAPPING',
      message: 'Objects "card2" and "card3" are overlapping significantly',
      objectIds: ['card2', 'card3'],
      overlap: 0.85,
      suggestion: 'Move objects apart or use align_objects tool'
    },
    {
      severity: 'warning',
      code: 'OUT_OF_VIEWPORT',
      message: 'Object "floating_logo" is outside camera viewport',
      objectId: 'floating_logo',
      position: [15, 5, -20],
      suggestion: 'Reposition object or adjust camera'
    }
  ],
  info: [
    {
      severity: 'info',
      code: 'PERFORMANCE_OK',
      message: 'Scene has 12 objects, well within performance limits',
      stats: {
        objectCount: 12,
        triangleCount: 48000,
        estimatedFPS: 60
      }
    }
  ]
}
```

#### 2. `check_performance`
```typescript
{
  name: 'check_performance',
  description: 'Analyze scene performance and get optimization suggestions',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      warnings: { type: 'boolean', default: true }
    },
    required: ['sceneId']
  }
}

// Example Response:
{
  performance: {
    objectCount: 45,
    triangleCount: 180000,
    estimatedFPS: 45,
    bottlenecks: [
      {
        type: 'high_triangle_count',
        severity: 'medium',
        message: 'Scene has 180k triangles, may impact performance on low-end devices',
        suggestion: 'Consider using simpler geometry or LOD system'
      },
      {
        type: 'many_transparent_objects',
        severity: 'low',
        message: '20 objects use transparency, may cause overdraw',
        suggestion: 'Reduce transparency or use opaque materials where possible'
      }
    ]
  },
  recommendations: [
    'Consider grouping nearby objects to reduce draw calls',
    'Use shared materials where possible',
    'Enable frustum culling for off-screen objects'
  ]
}
```

#### 3. `get_recommendations`
```typescript
{
  name: 'get_recommendations',
  description: 'Get AI-powered recommendations for improving the scene',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      focus: {
        type: 'string',
        enum: ['performance', 'aesthetics', 'accessibility', 'layout', 'all'],
        default: 'all'
      }
    },
    required: ['sceneId']
  }
}

// Example Response:
{
  recommendations: {
    performance: [
      'Group the 6 feature cards into a single container to reduce draw calls',
      'Use material instances instead of unique materials for similar objects'
    ],
    aesthetics: [
      'The circular layout could benefit from more spacing (current: 2.5, suggested: 3.0)',
      'Consider adding subtle rotation to cards for more dynamic composition',
      'Background gradient could use a third color for more depth'
    ],
    layout: [
      'Hero panel at Y=1.2 may be too high for comfortable viewing',
      'Consider centering the feature cards around origin for balanced composition'
    ],
    accessibility: [
      'Add more contrast between glass materials and background',
      'Ensure interactive elements are within comfortable reach (1.5 units from camera)'
    ]
  }
}
```

#### 4. `capture_screenshot`
```typescript
{
  name: 'capture_screenshot',
  description: 'Capture a screenshot of the scene from specified camera angle',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      cameraPosition: {
        type: 'array',
        items: { type: 'number' },
        description: 'Camera position [x, y, z]'
      },
      cameraTarget: {
        type: 'array',
        items: { type: 'number' },
        description: 'Point to look at [x, y, z]'
      },
      resolution: {
        type: 'string',
        enum: ['400x300', '800x600', '1280x720', '1920x1080'],
        default: '800x600'
      },
      format: {
        type: 'string',
        enum: ['png', 'jpeg'],
        default: 'png'
      }
    },
    required: ['sceneId']
  }
}

// Example Response:
{
  success: true,
  imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
  metadata: {
    resolution: '800x600',
    cameraPosition: [-3, 1.5, 3],
    cameraTarget: [0, 1, 0],
    timestamp: '2025-01-24T10:30:15Z'
  }
}
```

#### 5. `get_visual_comparison`
```typescript
{
  name: 'get_visual_comparison',
  description: 'Generate a visual comparison showing differences between states',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      beforeState: {
        type: 'string',
        description: 'State to compare from (e.g., "last_save", branch name, or timestamp)'
      },
      afterState: {
        type: 'string',
        description: 'State to compare to (e.g., "current", branch name)',
        default: 'current'
      },
      highlight: {
        type: 'string',
        enum: ['differences', 'additions', 'removals', 'modifications'],
        default: 'differences'
      },
      cameraPosition: { type: 'array', items: { type: 'number' } }
    },
    required: ['sceneId', 'beforeState']
  }
}

// Example Response:
{
  beforeImage: 'data:image/png;base64,...',
  afterImage: 'data:image/png;base64,...',
  diffImage: 'data:image/png;base64,...',  // Highlighted differences
  changes: {
    added: ['new_card_123'],
    removed: [],
    modified: ['hero_card', 'software_card'],
    positionChanges: [
      { objectId: 'hero_card', from: [0, 1, 0], to: [0, 1.2, 0] }
    ],
    materialChanges: [
      { objectId: 'software_card', property: 'color', from: '#FFFFFF', to: '#4A90E2' }
    ]
  }
}
```

#### 6. `batch_update`
```typescript
{
  name: 'batch_update',
  description: 'Update multiple objects with a single operation',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      filter: {
        type: 'object',
        description: 'Filter to select objects',
        properties: {
          type: { type: 'string' },
          name: { type: 'string' },
          tag: { type: 'string' },
          custom: { type: 'object', description: 'Custom query' }
        }
      },
      objectIds: {
        type: 'array',
        items: { type: 'string' },
        description: 'Specific object IDs (alternative to filter)'
      },
      updates: {
        type: 'object',
        description: 'Updates to apply to all matching objects',
        properties: {
          transform: { type: 'object' },
          material: { type: 'object' },
          visible: { type: 'boolean' },
          animations: { type: 'object' }
        }
      },
      save: { type: 'boolean', default: false }
    },
    required: ['sceneId', 'updates']
  }
}

// Example: Update all GlassCards
batch_update({
  sceneId: 'home',
  filter: { type: 'GlassCard' },
  updates: {
    material: {
      transmission: 0.92,
      emissiveIntensity: 0.4
    },
    transform: {
      scale: [1.2, 1.2, 1.2]
    }
  }
})
```

#### 7. `find_objects`
```typescript
{
  name: 'find_objects',
  description: 'Find objects matching complex query criteria',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      query: {
        type: 'object',
        description: 'MongoDB-style query',
        properties: {
          type: { type: 'string' },
          name: { type: 'string' },
          'material.transmission': { type: 'object' },  // e.g., { $gt: 0.9 }
          'position.y': { type: 'object' },  // e.g., { $between: [0.5, 1.5] }
          visible: { type: 'boolean' }
        }
      }
    },
    required: ['sceneId', 'query']
  }
}

// Example: Find all high-transmission glass in upper region
find_objects({
  sceneId: 'home',
  query: {
    type: 'GlassCard',
    'material.transmission': { $gt: 0.9 },
    'position.y': { $between: [0.5, 1.5] },
    visible: true
  }
})
```

#### 8. `get_objects_in_region`
```typescript
{
  name: 'get_objects_in_region',
  description: 'Get all objects within a specified 3D region',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      region: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['sphere', 'box', 'cylinder'],
            default: 'sphere'
          },
          center: { type: 'array', items: { type: 'number' } },
          radius: { type: 'number', description: 'For sphere type' },
          dimensions: { type: 'array', description: 'For box type: [width, height, depth]' },
          height: { type: 'number', description: 'For cylinder type' }
        },
        required: ['center']
      }
    },
    required: ['sceneId', 'region']
  }
}

// Example: Find objects near hero panel
get_objects_in_region({
  sceneId: 'home',
  region: {
    type: 'sphere',
    center: [0, 1.2, 0],
    radius: 2.5
  }
})
```

---

## Updated Priority Order

### Must Have (Critical for usability)
1. ✅ **Spatial helpers** - `measure_distance`, `get_viewport_bounds`, `align_objects`, `get_spatial_grid`
2. ✅ **Batch operations** - `batch_update`, `find_objects`
3. ✅ **Undo/redo** - `undo_last_change`, `redo_change`, `get_change_history`
4. ✅ **Material presets** - `apply_material_preset`, `list_material_presets`, `save_material_as_preset`
5. ✅ **Validation** - `validate_scene`, `check_performance`

### Should Have (Greatly improves workflow)
6. ✅ **Layout templates** - `create_layout`, `distribute_objects`, `apply_grid_layout`
7. ✅ **Animation sequences** - `create_animation_sequence`, `play_animation_sequence`
8. ✅ **Better querying** - `find_objects`, `get_objects_in_region`, `get_object_relationships`
9. ✅ **Object relationships** - `attach_to_parent`, `add_constraint`

### Nice to Have (Polish)
10. ✅ **Staging branches** - `create_staging_branch`, `preview_changes`, `merge_staging_branch`
11. ✅ **Visual feedback** - `capture_screenshot`, `get_visual_comparison`
12. ✅ **Recommendations** - `get_recommendations`

---

## Revised Implementation Timeline

### Original Phases (1-6): ~10 days
- Phase 1: Scene Definition Schema - 2 days
- Phase 2: Scene Loader System - 2 days
- Phase 3: Persistence Layer - 2 days
- Phase 4: Enhanced MCP Tools - 2 days
- Phase 5: Background System - 1 day
- Phase 6: Migration - 1 day

### New Enhanced Phases (7-11): ~8 days
- **Phase 7: Spatial Reasoning Tools** - 2 days
  - SpatialAnalyzer, distance measurement, viewport calculation
  - ASCII grid visualization
  - MCP tools: measure_distance, get_viewport_bounds, align_objects, get_spatial_grid, get_object_relationships

- **Phase 8: Layout Templates & Relationships** - 2 days
  - LayoutEngine with all pattern types
  - Constraint system
  - MCP tools: create_layout, distribute_objects, attach_to_parent, apply_grid_layout, add_constraint

- **Phase 9: Material Presets & Animation Sequencing** - 2 days
  - Material preset library
  - Animation sequencer with timeline
  - MCP tools: apply_material_preset, list_material_presets, save_material_as_preset, create_animation_sequence, play_animation_sequence

- **Phase 10: Undo/Redo & Staging** - 1 day
  - Change history tracking
  - Staging branch manager
  - MCP tools: undo_last_change, redo_change, get_change_history, create_staging_branch, merge_staging_branch, preview_changes

- **Phase 11: Validation & Visual Feedback** - 1 day
  - Scene validator with rules
  - Screenshot capture system
  - MCP tools: validate_scene, check_performance, get_recommendations, capture_screenshot, get_visual_comparison, batch_update, find_objects

### **Total Timeline: ~18 days**
- Original features: 10 days
- Enhanced toolkit: 8 days

### Accelerated Timeline: ~12 days
- Implement must-haves first (Phases 1-4, 7, 9, 11)
- Defer nice-to-haves (Phase 10 staging system)
- Basic versions of layout tools (Phase 8)

---

## Complete MCP Tool Summary

### Original Tools (from base plan)
1. `get_scene_definition` - Get full scene definition
2. `update_scene_definition` - Modify scene structure
3. `add_object_to_scene` - Add object to scene
4. `remove_object_from_scene` - Remove object
5. `update_object_in_scene` - Modify object
6. `set_background` - Configure background
7. `clone_scene` - Duplicate scene
8. `reset_scene` - Reset to default
9. `save_scene` - Save to file
10. `load_scene` - Load from file
11. `export_scene` - Export to custom path
12. `list_scene_backups` - List backups
13. `restore_scene_backup` - Restore from backup

### Phase 7: Spatial Reasoning (5 new tools)
14. `measure_distance` - Measure distance between objects
15. `get_viewport_bounds` - Get visible area
16. `align_objects` - Align multiple objects
17. `get_spatial_grid` - Get ASCII representation
18. `get_object_relationships` - Analyze spatial relationships

### Phase 8: Layout & Relationships (5 new tools)
19. `create_layout` - Create objects in pattern
20. `distribute_objects` - Rearrange in pattern
21. `attach_to_parent` - Parent-child relationship
22. `apply_grid_layout` - Grid arrangement
23. `add_constraint` - Position/rotation constraints

### Phase 9: Materials & Animation (6 new tools)
24. `apply_material_preset` - Apply material preset
25. `list_material_presets` - List available presets
26. `save_material_as_preset` - Save custom preset
27. `create_animation_sequence` - Create choreography
28. `play_animation_sequence` - Play sequence
29. `list_animation_sequences` - List saved sequences

### Phase 10: Undo/Redo & Staging (10 new tools)
30. `undo_last_change` - Undo changes
31. `redo_change` - Redo changes
32. `get_change_history` - View history
33. `create_staging_branch` - New experiment branch
34. `list_staging_branches` - List branches
35. `switch_staging_branch` - Switch branch
36. `merge_staging_branch` - Merge branch
37. `preview_changes` - Preview/compare
38. `commit_changes` - Commit with message
39. `discard_changes` - Discard uncommitted

### Phase 11: Validation & Feedback (8 new tools)
40. `validate_scene` - Validate for errors
41. `check_performance` - Performance analysis
42. `get_recommendations` - AI suggestions
43. `capture_screenshot` - Screenshot scene
44. `get_visual_comparison` - Visual diff
45. `batch_update` - Batch operation
46. `find_objects` - Complex query
47. `get_objects_in_region` - Spatial query

### **Total: 47 MCP Tools**

---

## Example: Complete Workflow with Enhanced Tools

### Scenario: Build a Product Showcase Scene from Scratch

```typescript
// 1. Create new scene from template
await clone_scene({
  sourceSceneId: 'blank_template',
  newSceneId: 'product_showcase',
  newName: 'Product Showcase 2025'
})

// 2. Set immersive background
await set_background({
  sceneId: 'product_showcase',
  background: {
    type: 'hemisphere',
    sphere: {
      radius: 50,
      material: {
        type: 'gradient',
        gradient: {
          colors: ['#0a0a1a', '#2a2a4a', '#4a4a8a'],
          direction: 'vertical'
        }
      }
    },
    stars: { enabled: true, count: 2000 }
  },
  save: true
})

// 3. Create hero product with preset material
const heroId = await add_object_to_scene({
  sceneId: 'product_showcase',
  object: {
    type: 'GlassCard',
    transform: { position: [0, 1.5, 0], rotation: [0, 0, 0], scale: [1.5, 1.5, 1.5] },
    glassProps: { title: 'New Product', subtitle: 'Revolutionary Design' }
  }
})

await apply_material_preset({
  sceneId: 'product_showcase',
  objectId: heroId,
  preset: 'holographic_purple',
  variations: { intensity: 1.3 }
})

// 4. Create feature cards in circular layout
await create_layout({
  sceneId: 'product_showcase',
  pattern: 'circular',
  objects: [
    { type: 'GlassCard', props: { title: 'Feature 1', subtitle: 'Amazing capability' } },
    { type: 'GlassCard', props: { title: 'Feature 2', subtitle: 'Incredible power' } },
    { type: 'GlassCard', props: { title: 'Feature 3', subtitle: 'Seamless integration' } },
    { type: 'GlassCard', props: { title: 'Feature 4', subtitle: 'Effortless workflow' } },
    { type: 'GlassCard', props: { title: 'Feature 5', subtitle: 'Built for teams' } },
    { type: 'GlassCard', props: { title: 'Feature 6', subtitle: 'Enterprise ready' } }
  ],
  layoutParams: {
    radius: 3.5,
    centerPosition: [0, 1, 0],
    rotateToFaceCenter: true
  }
})

// 5. Apply material preset to all feature cards
await batch_update({
  sceneId: 'product_showcase',
  filter: { name: /Feature \d/ },
  updates: {
    material: { preset: 'frosted_blue' }
  }
})

// 6. Validate scene
const validation = await validate_scene({
  sceneId: 'product_showcase',
  checks: ['overlapping_objects', 'out_of_bounds', 'performance']
})

if (!validation.valid) {
  console.log('Warnings:', validation.warnings)
  // Fix any issues...
}

// 7. Create entrance animation sequence
await create_animation_sequence({
  sceneId: 'product_showcase',
  sequenceName: 'entrance_showcase',
  timeline: [
    { objectId: heroId, animation: 'scaleIn', startTime: 0, duration: 800, easing: 'easeOut' },
    { objectId: 'feature_card_0', animation: 'fadeIn', startTime: 300, duration: 500 },
    { objectId: 'feature_card_1', animation: 'fadeIn', startTime: 400, duration: 500 },
    { objectId: 'feature_card_2', animation: 'fadeIn', startTime: 500, duration: 500 },
    { objectId: 'feature_card_3', animation: 'fadeIn', startTime: 600, duration: 500 },
    { objectId: 'feature_card_4', animation: 'fadeIn', startTime: 700, duration: 500 },
    { objectId: 'feature_card_5', animation: 'fadeIn', startTime: 800, duration: 500 }
  ],
  autoPlay: true
})

// 8. Get spatial overview
const grid = await get_spatial_grid({
  sceneId: 'product_showcase',
  view: 'top',
  showAxes: true
})
console.log(grid.asciiGrid)  // See the layout

// 9. Capture screenshot for verification
const screenshot = await capture_screenshot({
  sceneId: 'product_showcase',
  cameraPosition: [-4, 2, 4],
  cameraTarget: [0, 1, 0],
  resolution: '1280x720'
})
// Claude can see the screenshot and verify it looks good

// 10. Check performance
const perf = await check_performance({
  sceneId: 'product_showcase'
})
if (perf.performance.estimatedFPS < 55) {
  console.log('Performance concerns:', perf.bottlenecks)
}

// 11. Save everything
await save_scene({
  sceneId: 'product_showcase',
  createBackup: true
})

// User confirms it looks great!
// 12. Make some tweaks - enable staging for safety
await create_staging_branch({
  sceneId: 'product_showcase',
  branchName: 'tweak_colors'
})

// 13. Experiment with different colors
await batch_update({
  sceneId: 'product_showcase',
  filter: { type: 'GlassCard', name: /Feature/ },
  updates: {
    material: { color: '#6A9AE2', emissiveIntensity: 0.6 }
  }
})

// 14. Preview changes
const diff = await preview_changes({
  sceneId: 'product_showcase',
  compare: { from: 'main', to: 'tweak_colors' },
  showDiff: true
})

// 15. User loves it! Merge to main
await merge_staging_branch({
  sceneId: 'product_showcase',
  branchName: 'tweak_colors',
  deleteAfterMerge: true
})

// 16. Final save
await save_scene({
  sceneId: 'product_showcase',
  createBackup: true
})

console.log('✅ Product showcase scene complete and saved!')
```

---

## Summary

This enhanced plan transforms the Dynamic Scene Builder from a low-level API into a comprehensive **Scene Builder Toolkit** with:

### Higher-Level Abstractions
- 🎯 Spatial reasoning without vision
- 🎨 Material presets and templates
- 📐 Layout patterns and constraints
- 🎬 Animation choreography
- ⏪ Undo/redo with staging
- ✅ Validation and recommendations
- 👁️ Visual feedback via screenshots
- ⚡ Batch operations for efficiency

### Complete Tool Set
- **47 total MCP tools** (13 original + 34 new)
- Organized into logical phases
- Prioritized by importance
- Fully documented with examples

### Realistic Timeline
- **18 days** for complete implementation
- **12 days** for accelerated version (must-haves only)
- Can deliver incrementally phase by phase

### Improved Workflows
- Build scenes efficiently without visual access
- Experiment safely with staging branches
- Iterate rapidly with undo/redo
- Validate before committing
- Get AI-powered recommendations

**This is now a true Scene Builder Toolkit that enables Claude Desktop to build complex 3D experiences remotely with confidence and efficiency.** 🚀
