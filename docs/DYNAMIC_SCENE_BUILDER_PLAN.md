# Dynamic Scene Builder Implementation Plan

## Overview

Transform the three_split Liquid Glass website from a static, hardcoded scene to a fully dynamic, persistent scene builder system where Claude Desktop can:
- Create, modify, and remove ALL objects (including current "static" ones)
- Save scene changes that persist across sessions
- Build entire experiences from scratch
- Configure dynamic backgrounds (hemisphere/sphere backgrounds with camera at center)

## Current Architecture Issues

### Problems to Solve

1. **No Persistence**: Material changes to static objects revert on page reload
   - Static objects defined in JSX with hardcoded props
   - Material updates only affect runtime refs, not source
   - Scene state not saved anywhere

2. **Static Objects Immutable**: Can't remove or restructure static components
   - GlassCard, GlassPanel, GlassButton hardcoded in scene JSX
   - MCP can only create new dynamic objects, not modify scene structure
   - Each scene (HomeHub, ConsultingRoom, etc.) has fixed layout

3. **No Background Control**: Background is basic color/stars
   - No immersive hemisphere backgrounds
   - Can't customize or animate backgrounds
   - No layering system for depth

4. **Mixed Object Systems**: Confusing distinction between static and dynamic
   - Registered objects (static React components) vs dynamic (MCP-created)
   - Different APIs and capabilities for each type
   - Inconsistent behavior

## Target Architecture

### Vision

**Single Source of Truth**: All scenes defined in JSON files
- Scene definitions stored in `public/scenes/` directory
- Each route has a definition file (e.g., `home.json`, `consulting.json`)
- Hot reload: file changes automatically update scene
- Version control: scene definitions tracked in git

**Fully Dynamic Rendering**: Data-driven component instantiation
- Scene loader reads JSON, instantiates components
- All objects created equal (no static vs dynamic distinction)
- MCP can modify any object or entire scene structure

**Persistence Layer**: Save and load capabilities
- MCP tools to save scene state to JSON files
- Changes persist across sessions
- Export/import scene definitions

**Background System**: Immersive environment control
- Hemisphere/sphere backgrounds with camera at center
- Shader support for gradients, procedural effects
- Multiple layers for depth and parallax
- MCP-controllable background properties

## Implementation Phases

### Phase 1: Scene Definition Schema (Foundation)

**Goal**: Define the data structure for describing entire scenes

**Files to Create**:
- `src/types/sceneDefinition.ts` - TypeScript interfaces for scene definitions
- `public/scenes/schema.json` - JSON schema for validation
- `public/scenes/home.json` - Converted HomeHub scene
- `public/scenes/consulting.json` - Converted ConsultingRoom scene
- `public/scenes/software.json` - Converted SoftwareRoom scene
- `public/scenes/construction.json` - Converted ConstructionRoom scene
- `public/scenes/contact.json` - Converted ContactNode scene

**Scene Definition Structure**:
```typescript
interface SceneDefinition {
  id: string
  name: string
  version: string
  metadata: {
    author?: string
    description?: string
    created: string
    modified: string
  }

  camera: {
    position: [number, number, number]
    fov: number
    target?: [number, number, number]
  }

  background: BackgroundDefinition

  lighting: {
    ambient?: { intensity: number; color?: string }
    directional?: Array<{
      position: [number, number, number]
      intensity: number
      color?: string
      castShadow?: boolean
    }>
    point?: Array<{
      position: [number, number, number]
      intensity: number
      color?: string
    }>
  }

  environment: {
    preset?: string // drei Environment presets
    background?: boolean
  }

  objects: SceneObjectDefinition[]

  animations?: {
    ambient?: {
      enabled: boolean
      type: 'rotation' | 'float' | 'pulse'
      params: Record<string, unknown>
    }
  }
}

interface BackgroundDefinition {
  type: 'color' | 'gradient' | 'sphere' | 'hemisphere' | 'skybox'

  // For color type
  color?: string

  // For gradient type
  gradient?: {
    colors: string[]
    stops?: number[]
    direction?: 'vertical' | 'horizontal' | 'radial'
  }

  // For sphere/hemisphere type
  sphere?: {
    radius: number
    segments?: number
    material: {
      type: 'shader' | 'texture' | 'color'
      shader?: {
        vertex?: string
        fragment: string
        uniforms?: Record<string, unknown>
      }
      texture?: string
      color?: string
      gradient?: {
        colors: string[]
        stops?: number[]
        direction?: 'vertical' | 'horizontal' | 'radial'
      }
    }
    invertNormals?: boolean // true for inside view
  }

  // Additional effects
  stars?: {
    enabled: boolean
    count: number
    radius: number
    speed?: number
  }

  grid?: {
    enabled: boolean
    cellSize: number
    fadeDistance: number
  }
}

interface SceneObjectDefinition {
  id: string
  type: 'GlassButton' | 'GlassCard' | 'GlassPanel' | 'mesh' | 'group'
  name?: string

  transform: {
    position: [number, number, number]
    rotation: [number, number, number]
    scale: [number, number, number]
  }

  // Glass component props
  glassProps?: {
    width?: number
    height?: number
    thickness?: number
    title?: string
    subtitle?: string
    label?: string
    variant?: string
    size?: string
  }

  // Material properties
  material?: {
    type?: string
    color?: string
    transmission?: number
    roughness?: number
    ior?: number
    emissive?: string
    emissiveIntensity?: number
    metalness?: number
    clearcoat?: number
    opacity?: number
  }

  // Geometry (for mesh type)
  geometry?: {
    type: 'box' | 'sphere' | 'cylinder' | 'plane' | 'icosahedron' | 'torus'
    args: number[]
  }

  // Interaction
  interactions?: {
    onClick?: {
      type: 'navigate' | 'animate' | 'custom'
      target?: string
      animation?: string
    }
    onHover?: {
      type: 'animate' | 'material' | 'custom'
      params?: Record<string, unknown>
    }
  }

  // Animation state
  animations?: {
    enabled: boolean
    types: string[]
    autoPlay?: string[]
  }

  // Children (for group type)
  children?: SceneObjectDefinition[]

  visible: boolean
}
```

**Example Scene Definition** (`public/scenes/home.json`):
```json
{
  "id": "home",
  "name": "Home Hub",
  "version": "1.0.0",
  "metadata": {
    "description": "Main navigation hub with consulting, software, and construction cards",
    "created": "2025-01-24",
    "modified": "2025-01-24"
  },
  "camera": {
    "position": [-3, 1.5, 3],
    "fov": 50
  },
  "background": {
    "type": "hemisphere",
    "sphere": {
      "radius": 50,
      "segments": 64,
      "material": {
        "type": "shader",
        "shader": {
          "fragment": "gradient",
          "uniforms": {
            "color1": "#0a0a12",
            "color2": "#1a1a3e",
            "color3": "#2a2a5e"
          }
        }
      },
      "invertNormals": true
    },
    "stars": {
      "enabled": true,
      "count": 1000,
      "radius": 50,
      "speed": 0.5
    },
    "grid": {
      "enabled": true,
      "cellSize": 0.5,
      "fadeDistance": 15
    }
  },
  "lighting": {
    "ambient": { "intensity": 0.5 },
    "directional": [
      {
        "position": [5, 5, 5],
        "intensity": 1,
        "castShadow": true
      }
    ],
    "point": [
      {
        "position": [-5, 5, -5],
        "intensity": 0.5,
        "color": "#4A90D9"
      }
    ]
  },
  "environment": {
    "preset": "city",
    "background": false
  },
  "objects": [
    {
      "id": "hero_panel",
      "type": "GlassPanel",
      "name": "Hero Panel",
      "transform": {
        "position": [0, 1.2, 0],
        "rotation": [0, 0, 0],
        "scale": [1, 1, 1]
      },
      "glassProps": {
        "width": 2.0,
        "height": 1.2,
        "thickness": 0.04
      },
      "interactions": {
        "onClick": {
          "type": "navigate",
          "target": "consulting"
        }
      },
      "animations": {
        "enabled": true,
        "types": ["float"],
        "autoPlay": ["float"]
      },
      "visible": true
    },
    {
      "id": "consulting_card",
      "type": "GlassCard",
      "name": "Consulting Navigation",
      "transform": {
        "position": [-1.5, 0.8, -1.2],
        "rotation": [0, 0.2, 0],
        "scale": [1, 1, 1]
      },
      "glassProps": {
        "title": "Consulting",
        "subtitle": "Streamline operations"
      },
      "interactions": {
        "onClick": {
          "type": "navigate",
          "target": "consulting"
        }
      },
      "visible": true
    },
    {
      "id": "software_card",
      "type": "GlassCard",
      "name": "Software Navigation",
      "transform": {
        "position": [0, 0.8, -1.2],
        "rotation": [0, 0, 0],
        "scale": [1, 1, 1]
      },
      "glassProps": {
        "title": "Software",
        "subtitle": "Build custom tools"
      },
      "interactions": {
        "onClick": {
          "type": "navigate",
          "target": "software"
        }
      },
      "visible": true
    },
    {
      "id": "construction_card",
      "type": "GlassCard",
      "name": "Construction Navigation",
      "transform": {
        "position": [1.5, 0.8, -1.2],
        "rotation": [0, -0.2, 0],
        "scale": [1, 1, 1]
      },
      "glassProps": {
        "title": "Construction",
        "subtitle": "Design spaces"
      },
      "interactions": {
        "onClick": {
          "type": "navigate",
          "target": "construction"
        }
      },
      "visible": true
    },
    {
      "id": "floating_logo",
      "type": "mesh",
      "name": "Floating Logo",
      "transform": {
        "position": [0, 2, -0.5],
        "rotation": [0, 0, 0],
        "scale": [1, 1, 1]
      },
      "geometry": {
        "type": "icosahedron",
        "args": [0.15, 0]
      },
      "material": {
        "type": "MeshPhysicalMaterial",
        "transmission": 0.9,
        "roughness": 0.1,
        "ior": 1.5,
        "emissive": "#4A90E2",
        "emissiveIntensity": 0.3
      },
      "animations": {
        "enabled": true,
        "types": ["rotation"],
        "autoPlay": ["rotation"]
      },
      "visible": true
    }
  ]
}
```

---

### Phase 2: Background System (Visual Foundation)

**Goal**: Create immersive hemisphere/sphere backgrounds with camera at center

**Files to Create**:
- `src/components/backgrounds/BackgroundSphere.tsx` - Sphere/hemisphere component
- `src/components/backgrounds/BackgroundRenderer.tsx` - Renders background from definition
- `src/components/backgrounds/shaders/` - Shader presets
  - `gradientFragment.glsl` - Gradient shader
  - `proceduralSky.glsl` - Procedural sky
  - `nebula.glsl` - Space nebula effect
- `src/components/backgrounds/index.ts` - Exports

**Key Features**:
- Sphere geometry with inverted normals (camera at center looking out)
- Custom shader support for procedural effects
- Gradient rendering (vertical, horizontal, radial)
- Texture mapping support
- Z-ordering: Background always behind objects
- Performance optimized (single draw call, no transparency)

**BackgroundSphere Component**:
```typescript
interface BackgroundSphereProps {
  radius?: number
  segments?: number
  material: {
    type: 'shader' | 'color' | 'texture' | 'gradient'
    shader?: {
      vertex?: string
      fragment: string
      uniforms?: Record<string, any>
    }
    color?: string
    texture?: string
    gradient?: {
      colors: string[]
      stops?: number[]
      direction?: 'vertical' | 'horizontal' | 'radial'
    }
  }
  invertNormals?: boolean
}

export function BackgroundSphere({
  radius = 50,
  segments = 64,
  material,
  invertNormals = true
}: BackgroundSphereProps) {
  // Implementation with shader material
  // Renders behind all objects (renderOrder = -1000)
  // No lighting calculations needed
  // Supports hot reload of shader uniforms
}
```

**Example Gradients**:
- Twilight: `#0a0a12` → `#1a1a3e` → `#4a4a8e`
- Sunset: `#1a0a0a` → `#4a2a1a` → `#8a5a3a`
- Ocean: `#0a1a2a` → `#1a3a4a` → `#2a5a7a`
- Aurora: `#0a1a0a` → `#1a4a3a` → `#3a8a6a`

---

### Phase 3: Scene Loader System (Dynamic Rendering)

**Goal**: Load and render scenes from JSON definitions

**Files to Create**:
- `src/systems/scene-loader/SceneLoader.tsx` - Main loader component
- `src/systems/scene-loader/ObjectFactory.tsx` - Creates objects from definitions
- `src/systems/scene-loader/useSceneDefinition.ts` - Hook to load scene files
- `src/systems/scene-loader/SceneValidator.ts` - Validates scene JSON
- `src/systems/scene-loader/index.ts` - Exports

**Architecture**:
```
Scene.tsx
  └─ SceneLoader (loads definition from public/scenes/{node}.json)
      ├─ BackgroundRenderer (renders background)
      ├─ LightingRenderer (renders lights)
      ├─ EnvironmentRenderer (drei Environment)
      └─ ObjectsRenderer
          └─ ObjectFactory (creates each object)
              ├─ GlassButton (if type = GlassButton)
              ├─ GlassCard (if type = GlassCard)
              ├─ GlassPanel (if type = GlassPanel)
              ├─ DynamicMesh (if type = mesh)
              └─ Group (if type = group, recursive)
```

**useSceneDefinition Hook**:
```typescript
export function useSceneDefinition(sceneId: string) {
  const [definition, setDefinition] = useState<SceneDefinition | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetch(`/scenes/${sceneId}.json`)
      .then(res => res.json())
      .then(data => {
        // Validate schema
        const validated = validateSceneDefinition(data)
        setDefinition(validated)
        setLoading(false)
      })
      .catch(err => {
        setError(err)
        setLoading(false)
      })
  }, [sceneId])

  // Watch for file changes in development
  useEffect(() => {
    if (import.meta.env.DEV) {
      const ws = new WebSocket('ws://localhost:5173')
      ws.addEventListener('message', (event) => {
        if (event.data.includes(`scenes/${sceneId}.json`)) {
          // Reload scene
          window.location.reload()
        }
      })
    }
  }, [sceneId])

  return { definition, loading, error }
}
```

**ObjectFactory Component**:
```typescript
export function ObjectFactory({
  definition,
  reducedMotion,
  reducedTransparency
}: ObjectFactoryProps) {
  const { position, rotation, scale } = definition.transform

  // Handle interactions
  const handleClick = useCallback(() => {
    if (definition.interactions?.onClick) {
      const { type, target, animation } = definition.interactions.onClick
      if (type === 'navigate') navigateTo(target)
      if (type === 'animate') triggerAnimation(animation)
      // ... etc
    }
  }, [definition])

  // Render based on type
  switch (definition.type) {
    case 'GlassButton':
      return (
        <GlassButton
          id={definition.id}
          position={position}
          rotation={rotation}
          {...definition.glassProps}
          onClick={handleClick}
        />
      )

    case 'GlassCard':
      return (
        <GlassCard
          id={definition.id}
          position={position}
          rotation={rotation}
          {...definition.glassProps}
          onClick={handleClick}
        />
      )

    case 'mesh':
      return (
        <DynamicMesh
          definition={definition}
          onClick={handleClick}
        />
      )

    case 'group':
      return (
        <group position={position} rotation={rotation} scale={scale}>
          {definition.children?.map(child => (
            <ObjectFactory key={child.id} definition={child} />
          ))}
        </group>
      )
  }
}
```

---

### Phase 4: Persistence Layer (Save/Load)

**Goal**: Enable saving scene changes back to JSON files

**Files to Create**:
- `src/systems/persistence/ScenePersistence.ts` - Save/load utilities
- `src/systems/persistence/useAutoSave.ts` - Auto-save hook
- `mcp-server/src/tools/persistence.ts` - MCP tools for save/load
- `mcp-server/src/utils/fileWriter.ts` - Safe file writing

**MCP Tools**:

1. **save_scene** - Save current scene state to JSON file
```typescript
{
  name: 'save_scene',
  description: 'Save the current scene state to a JSON file, persisting all changes',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: {
        type: 'string',
        description: 'Scene ID to save (home, consulting, software, construction, contact)'
      },
      path: {
        type: 'string',
        description: 'Optional custom path. Defaults to public/scenes/{sceneId}.json'
      },
      createBackup: {
        type: 'boolean',
        description: 'Create backup of existing file before overwriting'
      }
    },
    required: ['sceneId']
  }
}
```

2. **load_scene** - Load scene from JSON file
```typescript
{
  name: 'load_scene',
  description: 'Load a scene definition from a JSON file',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      path: { type: 'string' }
    },
    required: ['sceneId']
  }
}
```

3. **export_scene** - Export scene to custom location
```typescript
{
  name: 'export_scene',
  description: 'Export scene definition to a custom file path for sharing',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      outputPath: { type: 'string' },
      includeMetadata: { type: 'boolean' }
    },
    required: ['sceneId', 'outputPath']
  }
}
```

4. **list_scene_backups** - List available backups
```typescript
{
  name: 'list_scene_backups',
  description: 'List all backup files for a scene',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' }
    },
    required: ['sceneId']
  }
}
```

5. **restore_scene_backup** - Restore from backup
```typescript
{
  name: 'restore_scene_backup',
  description: 'Restore scene from a backup file',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      backupFile: { type: 'string' }
    },
    required: ['sceneId', 'backupFile']
  }
}
```

**File Writing Safety**:
- Atomic writes (write to temp file, then rename)
- Automatic backups before overwrite
- Validation before writing
- Error recovery

---

### Phase 5: Enhanced MCP Tools (Full Control)

**Goal**: Give MCP complete control over scene structure

**New MCP Tools**:

1. **get_scene_definition** - Get full scene definition
```typescript
{
  name: 'get_scene_definition',
  description: 'Get the complete scene definition for a route',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' }
    },
    required: ['sceneId']
  }
}
```

2. **update_scene_definition** - Modify scene structure
```typescript
{
  name: 'update_scene_definition',
  description: 'Update any part of the scene definition',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      updates: {
        type: 'object',
        description: 'Partial scene definition with changes'
      },
      save: {
        type: 'boolean',
        description: 'Save to file after updating'
      }
    },
    required: ['sceneId', 'updates']
  }
}
```

3. **add_object_to_scene** - Add object to scene definition
```typescript
{
  name: 'add_object_to_scene',
  description: 'Add a new object to the scene definition',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      object: {
        type: 'object',
        description: 'Scene object definition'
      },
      save: { type: 'boolean' }
    },
    required: ['sceneId', 'object']
  }
}
```

4. **remove_object_from_scene** - Remove object from scene
```typescript
{
  name: 'remove_object_from_scene',
  description: 'Remove an object from the scene definition',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      objectId: { type: 'string' },
      save: { type: 'boolean' }
    },
    required: ['sceneId', 'objectId']
  }
}
```

5. **update_object_in_scene** - Modify object in scene
```typescript
{
  name: 'update_object_in_scene',
  description: 'Update properties of an object in the scene definition',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      objectId: { type: 'string' },
      updates: {
        type: 'object',
        description: 'Partial object definition with changes'
      },
      save: { type: 'boolean' }
    },
    required: ['sceneId', 'objectId', 'updates']
  }
}
```

6. **set_background** - Configure scene background
```typescript
{
  name: 'set_background',
  description: 'Set the background for a scene',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      background: {
        type: 'object',
        description: 'Background definition'
      },
      save: { type: 'boolean' }
    },
    required: ['sceneId', 'background']
  }
}
```

7. **clone_scene** - Duplicate a scene
```typescript
{
  name: 'clone_scene',
  description: 'Clone a scene definition to create a new variant',
  inputSchema: {
    type: 'object',
    properties: {
      sourceSceneId: { type: 'string' },
      newSceneId: { type: 'string' },
      newName: { type: 'string' }
    },
    required: ['sourceSceneId', 'newSceneId']
  }
}
```

8. **reset_scene** - Reset to default
```typescript
{
  name: 'reset_scene',
  description: 'Reset scene to default/original state',
  inputSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      createBackup: { type: 'boolean' }
    },
    required: ['sceneId']
  }
}
```

---

### Phase 6: Migration & Backwards Compatibility

**Goal**: Smooth transition from static to dynamic system

**Strategy**:
1. Keep existing static scene components
2. Add feature flag: `USE_DYNAMIC_SCENES`
3. If flag enabled, use SceneLoader
4. If flag disabled, use existing components
5. Gradual migration route by route

**Modified Scene.tsx**:
```typescript
export default function Scene({ reducedMotion, reducedTransparency }: SceneProps) {
  const { currentNode } = useNavigationStore()
  const useDynamic = import.meta.env.VITE_USE_DYNAMIC_SCENES === 'true'

  return (
    <>
      {useDynamic ? (
        // New dynamic system
        <SceneLoader
          sceneId={currentNode}
          reducedMotion={reducedMotion}
          reducedTransparency={reducedTransparency}
        />
      ) : (
        // Legacy static system
        <>
          {currentNode === 'home' && <HomeHub {...props} />}
          {currentNode === 'consulting' && <ConsultingRoom {...props} />}
          {/* ... etc */}
        </>
      )}
    </>
  )
}
```

**Migration Script**:
Create utility to convert existing JSX components to JSON:
```bash
npm run migrate-scene -- --scene=home
```

---

## Implementation Order

### Sprint 1: Foundation (Days 1-2)
1. Create scene definition TypeScript interfaces
2. Create JSON schema for validation
3. Convert HomeHub to JSON definition (proof of concept)
4. Create BackgroundSphere component
5. Test hemisphere background rendering

### Sprint 2: Scene Loader (Days 3-4)
1. Create useSceneDefinition hook
2. Create ObjectFactory component
3. Create SceneLoader component
4. Integrate into Scene.tsx with feature flag
5. Test loading home.json and rendering

### Sprint 3: Persistence (Days 5-6)
1. Create file writer utilities (safe, atomic writes)
2. Add save_scene MCP tool
3. Add load_scene MCP tool
4. Test saving changes and reloading
5. Add backup/restore functionality

### Sprint 4: MCP Enhancement (Days 7-8)
1. Add get_scene_definition tool
2. Add update_scene_definition tool
3. Add add/remove/update object tools
4. Add set_background tool
5. Test full scene building workflow

### Sprint 5: Background System (Day 9)
1. Create shader presets (gradient, procedural sky, nebula)
2. Add BackgroundRenderer component
3. Test various background types
4. Optimize performance

### Sprint 6: Migration & Testing (Day 10)
1. Convert all scenes to JSON
2. Test all routes with dynamic loader
3. Performance profiling
4. Documentation updates
5. Enable by default

---

## Technical Considerations

### Performance

**Loading Time**:
- Scene JSON is small (<50KB typically)
- Parse once, cache in memory
- Lazy load textures/shaders

**Rendering**:
- No performance difference vs static JSX
- Same components, just data-driven instantiation
- Background sphere: single draw call

**Hot Reload**:
- Watch scene files in development
- Automatic refresh on change
- No full page reload needed

### Security

**File Writing**:
- MCP server has file system access (by design)
- Only write to `public/scenes/` directory
- Validate all paths (prevent directory traversal)
- Backup before overwrite

**JSON Validation**:
- Validate schema before applying
- Sanitize user inputs
- Prevent code injection in shaders

### Browser Caching

**Scene Definitions**:
- Add cache headers for production
- Cache bust with version query param
- Service worker for offline support

---

## User Experience Improvements

### Real-time Preview

**Development Mode**:
- File watcher monitors `public/scenes/`
- Hot reload on save
- Claude can edit JSON, see changes instantly

**Live Editing**:
- MCP changes reflected in <100ms
- Smooth transitions between states
- Undo/redo via backups

### Error Handling

**Invalid Definitions**:
- Schema validation with helpful errors
- Fallback to default scene on error
- Error boundary around SceneLoader

**Missing Assets**:
- Graceful degradation
- Placeholder materials/textures
- Console warnings

---

## Example Workflows

### Workflow 1: Build New Scene from Scratch

```typescript
// 1. Claude: Create blank scene
await mcp.call('clone_scene', {
  sourceSceneId: 'blank_template',
  newSceneId: 'my_showcase',
  newName: 'Product Showcase'
})

// 2. Claude: Set immersive background
await mcp.call('set_background', {
  sceneId: 'my_showcase',
  background: {
    type: 'hemisphere',
    sphere: {
      radius: 50,
      material: {
        type: 'shader',
        shader: {
          fragment: 'gradient',
          uniforms: {
            color1: '#0a0a1a',
            color2: '#2a2a4a',
            color3: '#4a4a8a'
          }
        }
      }
    },
    stars: { enabled: true, count: 2000 }
  },
  save: true
})

// 3. Claude: Add hero product card
await mcp.call('add_object_to_scene', {
  sceneId: 'my_showcase',
  object: {
    id: 'hero_product',
    type: 'GlassCard',
    transform: { position: [0, 1.5, 0], rotation: [0, 0, 0], scale: [1.5, 1.5, 1.5] },
    glassProps: { title: 'New Product', subtitle: 'Revolutionary design' },
    material: { emissiveIntensity: 0.5, color: '#4A90E2' }
  },
  save: true
})

// 4. Claude: Add surrounding feature cards
for (let i = 0; i < 6; i++) {
  const angle = (i / 6) * Math.PI * 2
  const x = Math.cos(angle) * 3
  const z = Math.sin(angle) * 3

  await mcp.call('add_object_to_scene', {
    sceneId: 'my_showcase',
    object: {
      id: `feature_${i}`,
      type: 'GlassCard',
      transform: {
        position: [x, 1, z],
        rotation: [0, -angle, 0],
        scale: [1, 1, 1]
      },
      glassProps: { title: `Feature ${i + 1}`, subtitle: 'Amazing capability' }
    },
    save: false // Don't save each one individually
  })
}

// 5. Claude: Save all changes at once
await mcp.call('save_scene', { sceneId: 'my_showcase', createBackup: true })
```

### Workflow 2: Iterative Material Refinement

```typescript
// 1. Claude: Get current scene
const scene = await mcp.call('get_scene_definition', { sceneId: 'home' })

// 2. Claude: Update multiple card materials
for (const card of scene.objects.filter(o => o.type === 'GlassCard')) {
  await mcp.call('update_object_in_scene', {
    sceneId: 'home',
    objectId: card.id,
    updates: {
      material: {
        transmission: 0.92,
        roughness: 0.08,
        emissiveIntensity: 0.4,
        color: '#6A9AE2'
      }
    },
    save: false
  })
}

// 3. Claude: Save after user approves
await mcp.call('save_scene', { sceneId: 'home', createBackup: true })
```

### Workflow 3: Dynamic Background Changes

```typescript
// 1. Claude: Morning theme
await mcp.call('set_background', {
  sceneId: 'home',
  background: {
    type: 'hemisphere',
    sphere: {
      material: {
        type: 'gradient',
        gradient: {
          colors: ['#FFE5B4', '#FFA500', '#FF6B35'],
          direction: 'vertical'
        }
      }
    }
  },
  save: true
})

// 2. Later: Evening theme
await mcp.call('set_background', {
  sceneId: 'home',
  background: {
    type: 'hemisphere',
    sphere: {
      material: {
        type: 'gradient',
        gradient: {
          colors: ['#0a0a1a', '#1a1a3a', '#3a3a6a'],
          direction: 'vertical'
        }
      }
    },
    stars: { enabled: true, count: 3000, speed: 0.3 }
  },
  save: true
})
```

---

## Expected Outcomes

### For Users
- Fully customizable scenes that persist
- MCP can build complete experiences from scratch
- Immersive backgrounds with depth
- Smooth workflow: describe → build → save → persist

### For Development
- Data-driven architecture (easier to maintain)
- Version control for scene designs
- No code changes needed for scene modifications
- Easy to share/export scene definitions

### For Claude Desktop
- Full creative control over 3D space
- Can iterate rapidly on designs
- Material changes persist automatically
- Build libraries of reusable scenes

---

## Open Questions

1. **Scene Versioning**: How to handle schema changes over time?
   - Use semver in scene definitions
   - Migration scripts for version upgrades

2. **Asset Management**: Where to store custom textures/shaders?
   - `public/assets/textures/`
   - `public/assets/shaders/`
   - Reference by path in scene definitions

3. **Performance Limits**: How many objects before performance degrades?
   - Profile with test scenes
   - Add object count warnings
   - Implement LOD system if needed

4. **Collaboration**: Multiple users editing same scene?
   - Not initial scope
   - Future: Add conflict resolution
   - Future: Real-time collaboration via WebSocket

---

## Success Criteria

✅ **Phase 1 Complete When**:
- All 5 scenes converted to JSON
- Schema validated and documented
- BackgroundSphere rendering correctly

✅ **Phase 2 Complete When**:
- SceneLoader can render any scene from JSON
- Feature flag toggles between static/dynamic
- Home scene works identically in both modes

✅ **Phase 3 Complete When**:
- save_scene persists changes to disk
- Reloading page shows saved changes
- Backup system working

✅ **Phase 4 Complete When**:
- MCP can add/remove/modify any object
- set_material changes persist after save
- Claude can build scene from scratch

✅ **Phase 5 Complete When**:
- Multiple background types working
- Gradient, shader, texture backgrounds tested
- Background doesn't interfere with objects

✅ **Phase 6 Complete When**:
- All routes migrated to dynamic system
- Legacy code removed
- Performance benchmarks met
- Documentation updated

---

## Timeline Estimate

**Total: ~10 days** (assuming single developer, full-time)

- Phase 1: 2 days
- Phase 2: 2 days
- Phase 3: 2 days
- Phase 4: 2 days
- Phase 5: 1 day
- Phase 6: 1 day

**Accelerated**: Could complete in 5-6 days with focused effort

**Conservative**: 2 weeks with testing, documentation, polish

---

## Next Steps

1. Review and approve this plan
2. Create initial branch: `claude/dynamic-scene-builder-[session-id]`
3. Start with Phase 1: Scene definition schema
4. Build incrementally, test each phase
5. Deploy when all success criteria met

Ready to proceed? 🚀
