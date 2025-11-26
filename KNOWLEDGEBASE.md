# Three Split MCP Server - Knowledgebase

> Complete guide to building and manipulating 3D scenes using the Three Split MCP Server in Claude Desktop

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
4. [MCP Tools Reference](#mcp-tools-reference)
5. [Scene Building Workflows](#scene-building-workflows)
6. [Common Patterns](#common-patterns)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The Three Split MCP Server enables AI assistants to interact with a 3D React Three Fiber application in real-time. It provides tools to:

- **Inspect** scene state (objects, positions, materials, animations)
- **Create** dynamic 3D objects (glass panels, cards, buttons, primitives)
- **Manipulate** object transforms (position, rotation, scale)
- **Control** materials and visual properties (transparency, color, roughness)
- **Trigger** animations and state changes
- **Navigate** between different scene nodes

### Use Cases

- **Interactive 3D Presentations**: Build dynamic scenes for data visualization
- **UI Prototyping**: Test glass morphism designs and interactions
- **Animation Demos**: Choreograph complex animation sequences
- **Scene Composition**: Arrange and style 3D elements programmatically

---

## Architecture

### System Components

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  Claude Desktop │ ◄─MCP──►│   MCP Server    │ ◄─WS───►│  Relay Server   │
│   (You/AI)      │         │  (Node.js)      │         │   (Port 3001)   │
└─────────────────┘         └─────────────────┘         └────────┬────────┘
                                                                  │
                                                                  │ WebSocket
                                                                  │
                                                         ┌────────▼────────┐
                                                         │  React Three    │
                                                         │  Fiber App      │
                                                         │  (localhost)    │
                                                         └─────────────────┘
```

### Key Concepts

**Scene Registry**: A centralized store tracking all registered components (GlassButtons, GlassCards, GlassPanels). These are static UI elements built into the app.

**Dynamic Objects**: Objects created at runtime via MCP tools. These are temporary and stored in the app's Zustand store.

**Scene Nodes**: Named locations in the 3D space (home, consulting, software, construction, contact). Objects can be attached to nodes.

**Material Properties**: Visual characteristics of glass objects (transmission, roughness, color, etc.)

---

## Getting Started

### Prerequisites

1. All servers running (use the startup script: `./start.sh` or `start.bat`)
2. Claude Desktop connected to the MCP server
3. React app running at `http://localhost:5173`

### Quick Start Example

```typescript
// 1. Get a snapshot of the current scene
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "scene_snapshot",
  arguments: {}
})

// 2. Create a glass card in the scene
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "create_object",
  arguments: {
    type: "GlassCard",
    position: [0, 1.2, 0],
    properties: {
      title: "Hello World",
      subtitle: "My first MCP object"
    }
  }
})

// 3. Change its material to frosted glass
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "set_material",
  arguments: {
    objectId: "mcp_1234567890_abc123", // ID from create response
    preset: "frosted"
  }
})
```

---

## MCP Tools Reference

### 📸 Scene Inspection Tools

#### `scene_snapshot`

Get a complete JSON snapshot of the current 3D scene.

**Arguments:** None

**Returns:**
```json
{
  "camera": {
    "position": [0, 1.5, 4],
    "lookAt": [0, 1.2, 0]
  },
  "currentNode": "home",
  "isTransitioning": false,
  "objects": [...],
  "registeredObjects": [...]
}
```

**Use When:**
- Starting a new task to understand the scene
- Checking current state before making changes
- Debugging unexpected behavior

---

#### `list_objects`

List all dynamic objects in the scene with optional filtering.

**Arguments:**
- `node` (optional): Filter by scene node ("home", "consulting", "software", "construction", "contact")
- `type` (optional): Filter by object type ("GlassPanel", "GlassCard", "GlassButton", "Box", etc.)

**Example:**
```typescript
// List all objects in the consulting node
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "list_objects",
  arguments: {
    node: "consulting"
  }
})

// List all GlassCard objects
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "list_objects",
  arguments: {
    type: "GlassCard"
  }
})
```

---

#### `get_object`

Get detailed information about a specific object by its ID.

**Arguments:**
- `objectId` (required): The unique ID of the object

**Example:**
```typescript
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "get_object",
  arguments: {
    objectId: "mcp_1234567890_abc123"
  }
})
```

**Returns:**
```json
{
  "id": "mcp_1234567890_abc123",
  "type": "GlassCard",
  "position": [0, 1.2, 0],
  "rotation": [0, 0, 0],
  "scale": [1, 1, 1],
  "properties": {
    "title": "Hello World",
    "subtitle": "My first MCP object"
  },
  "parentNode": "home",
  "visible": true,
  "material": {...}
}
```

---

#### `get_registered_objects`

Get all registered static objects (built-in UI elements).

**Arguments:**
- `node` (optional): Filter by parent node
- `type` (optional): Filter by object type ("GlassButton", "GlassCard", "GlassPanel")

**Example:**
```typescript
// Get all registered objects in the home node
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "get_registered_objects",
  arguments: {
    node: "home"
  }
})
```

**Use When:**
- Finding built-in UI elements to manipulate
- Discovering available objects for animation
- Understanding the scene's static structure

---

### 🎨 Object Creation & Manipulation Tools

#### `create_object`

Create a new 3D object in the scene.

**Arguments:**
- `type` (required): Object type - "GlassPanel", "GlassCard", "GlassButton", "Box", "Sphere", "Cylinder", "Text3D"
- `position` (required): World position [x, y, z]
- `rotation` (optional): Euler rotation in radians [x, y, z]
- `scale` (optional): Scale factor [x, y, z]
- `properties` (optional): Type-specific properties
- `parentNode` (optional): Which scene node to attach to

**Examples:**

**Create a Glass Card:**
```typescript
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "create_object",
  arguments: {
    type: "GlassCard",
    position: [0, 1.5, 0],
    properties: {
      title: "Project Overview",
      subtitle: "Q4 2024 Goals",
      width: 1.0,
      height: 0.6
    },
    parentNode: "consulting"
  }
})
```

**Create a Glass Button:**
```typescript
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "create_object",
  arguments: {
    type: "GlassButton",
    position: [-0.5, 1.2, 0.5],
    properties: {
      label: "Click Me",
      variant: "primary"
    }
  }
})
```

**Create a Primitive Sphere:**
```typescript
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "create_object",
  arguments: {
    type: "Sphere",
    position: [1, 1, -1],
    scale: [0.3, 0.3, 0.3],
    properties: {
      radius: 0.5,
      color: "#4A90D9"
    }
  }
})
```

---

#### `edit_object`

Modify an existing object's transform, properties, or visibility.

**Arguments:**
- `objectId` (required): ID of the object to edit
- `position` (optional): New world position [x, y, z]
- `rotation` (optional): New rotation in radians [x, y, z]
- `scale` (optional): New scale [x, y, z]
- `properties` (optional): Properties to update
- `visible` (optional): Show or hide the object

**Examples:**

**Move an object:**
```typescript
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "edit_object",
  arguments: {
    objectId: "mcp_1234567890_abc123",
    position: [2, 1.5, 0]
  }
})
```

**Rotate and scale:**
```typescript
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "edit_object",
  arguments: {
    objectId: "mcp_1234567890_abc123",
    rotation: [0, 0.785, 0],  // 45 degrees around Y axis
    scale: [1.5, 1.5, 1.5]
  }
})
```

**Hide an object:**
```typescript
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "edit_object",
  arguments: {
    objectId: "mcp_1234567890_abc123",
    visible: false
  }
})
```

---

#### `delete_object`

Remove an object from the scene permanently.

**Arguments:**
- `objectId` (required): ID of the object to delete

**Example:**
```typescript
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "delete_object",
  arguments: {
    objectId: "mcp_1234567890_abc123"
  }
})
```

---

### 🎭 Material & Visual Tools

#### `set_material`

Change an object's glass material properties using presets or fine-tuned values.

**Arguments:**
- `objectId` (required): ID of the object to modify
- `preset` (optional): "standard", "frosted", "clear", "tinted", "highContrast"
- `transmission` (optional): Glass transparency (0-1, higher = more transparent)
- `roughness` (optional): Surface roughness/blur (0-1, higher = more frosted)
- `color` (optional): Tint color as hex string (e.g., "#4A90D9")

**Examples:**

**Use a preset:**
```typescript
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "set_material",
  arguments: {
    objectId: "mcp_1234567890_abc123",
    preset: "frosted"
  }
})
```

**Fine-tune material properties:**
```typescript
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "set_material",
  arguments: {
    objectId: "mcp_1234567890_abc123",
    transmission: 0.8,
    roughness: 0.2,
    color: "#FF6B9D"
  }
})
```

**Material Presets:**
- `standard`: Balanced transparency and clarity
- `frosted`: High roughness, lower transmission
- `clear`: Maximum transparency, minimal roughness
- `tinted`: Medium transparency with color
- `highContrast`: Low transmission, high roughness

---

#### `get_material_params`

Get the current material parameters of a registered object.

**Arguments:**
- `objectId` (required): ID of the object to query

**Example:**
```typescript
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "get_material_params",
  arguments: {
    objectId: "home-card-1"
  }
})
```

---

#### `set_material_params`

Set material parameters of a registered object for fine-grained control.

**Arguments:**
- `objectId` (required): ID of the object to modify
- `transmission` (optional): Glass transmission (0-1)
- `roughness` (optional): Surface roughness (0-1)
- `ior` (optional): Index of refraction (typically 1.45 for glass)
- `emissiveIntensity` (optional): Glow intensity (0-1)
- `color` (optional): Tint color (hex string)
- `envMapIntensity` (optional): Environment reflection intensity
- `clearcoat` (optional): Clearcoat layer intensity (0-1)

**Example:**
```typescript
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "set_material_params",
  arguments: {
    objectId: "home-card-1",
    transmission: 0.9,
    roughness: 0.1,
    ior: 1.5,
    emissiveIntensity: 0.3,
    color: "#4A90D9"
  }
})
```

---

### 🎬 Animation & State Tools

#### `get_animation_state`

Get the current animation state of a registered object (hovered, pressed, loading, etc.).

**Arguments:**
- `objectId` (required): ID of the object to query

**Example:**
```typescript
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "get_animation_state",
  arguments: {
    objectId: "home-button-1"
  }
})
```

---

#### `set_animation_state`

Set the animation state of a registered object (simulate hover, press, etc.).

**Arguments:**
- `objectId` (required): ID of the object to modify
- `hovered` (optional): Set hover state
- `pressed` (optional): Set pressed state
- `loading` (optional): Set loading state
- `disabled` (optional): Set disabled state

**Examples:**

**Simulate hover:**
```typescript
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "set_animation_state",
  arguments: {
    objectId: "home-button-1",
    hovered: true
  }
})
```

**Show loading state:**
```typescript
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "set_animation_state",
  arguments: {
    objectId: "home-card-1",
    loading: true
  }
})
```

---

#### `trigger_animation`

Trigger a specific animation on a registered object.

**Arguments:**
- `objectId` (required): ID of the object to animate
- `animation` (required): Animation name ("pulse", "ripple", "glow", "liquidDeform", "fresnelShift", "refractionWave", "shake", etc.)
- `params` (optional): Animation-specific parameters
  - `intensity` (number): Animation strength
  - `duration` (number): Animation duration in ms
  - `color` (string): Color for glow/pulse effects
  - `origin` (array): [x, y] UV coordinates for ripple origin

**Examples:**

**Trigger a pulse animation:**
```typescript
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "trigger_animation",
  arguments: {
    objectId: "home-card-1",
    animation: "pulse",
    params: {
      intensity: 1.2,
      duration: 1000,
      color: "#4A90D9"
    }
  }
})
```

**Trigger a ripple effect:**
```typescript
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "trigger_animation",
  arguments: {
    objectId: "home-card-1",
    animation: "ripple",
    params: {
      origin: [0.5, 0.5],  // Center of the object
      intensity: 0.8
    }
  }
})
```

**Available Animations:**
- `pulse`: Scaling pulse effect
- `ripple`: Water ripple effect from a point
- `glow`: Emissive glow pulse
- `liquidDeform`: Liquid-like deformation
- `fresnelShift`: Fresnel reflection shift
- `refractionWave`: Wave-like refraction
- `shake`: Shake/vibrate effect

---

#### `list_animations`

List available animations for an object or object type.

**Arguments:**
- `objectId` (optional): ID of a specific object
- `type` (optional): Object type ("GlassButton", "GlassCard", "GlassPanel")

**Example:**
```typescript
// List animations for a specific object
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "list_animations",
  arguments: {
    objectId: "home-card-1"
  }
})

// List animations for all GlassCards
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "list_animations",
  arguments: {
    type: "GlassCard"
  }
})
```

---

### 🧭 Navigation Tools

#### `navigate_to`

Navigate the camera to a different scene node.

**Arguments:**
- `node` (optional): Target node ("home", "consulting", "software", "construction", "contact")

**Example:**
```typescript
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "navigate_to",
  arguments: {
    node: "consulting"
  }
})
```

**Use When:**
- Moving between different areas of the scene
- Setting up context before creating objects
- Creating tours or presentations

---

## Scene Building Workflows

### Workflow 1: Creating an Informational Display

**Goal:** Create a set of glass cards showing project information.

```typescript
// Step 1: Navigate to the right node
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "navigate_to",
  arguments: { node: "consulting" }
})

// Step 2: Create title card
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "create_object",
  arguments: {
    type: "GlassCard",
    position: [0, 1.5, 0],
    properties: {
      title: "Q4 2024 Roadmap",
      subtitle: "Strategic Initiatives"
    }
  }
})

// Step 3: Create sub-cards (remember to store the IDs!)
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "create_object",
  arguments: {
    type: "GlassCard",
    position: [-1, 1.0, 0],
    properties: {
      title: "Product Launch",
      subtitle: "December 2024"
    }
  }
})

// Step 4: Style the cards with different materials
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "set_material",
  arguments: {
    objectId: "mcp_1234567890_abc123",  // From create response
    preset: "highContrast"
  }
})
```

---

### Workflow 2: Creating an Interactive Menu

**Goal:** Build a menu of glass buttons with hover effects.

```typescript
// Step 1: Get snapshot to understand current state
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "scene_snapshot",
  arguments: {}
})

// Step 2: Create button grid
const positions = [
  [-0.6, 1.2, 0],
  [0, 1.2, 0],
  [0.6, 1.2, 0]
]

// Create buttons (do this 3 times with different positions)
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "create_object",
  arguments: {
    type: "GlassButton",
    position: positions[0],
    properties: {
      label: "Start",
      variant: "primary"
    }
  }
})

// Step 3: Test hover effects on registered buttons
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "get_registered_objects",
  arguments: { type: "GlassButton" }
})

// Step 4: Simulate hover on a button
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "set_animation_state",
  arguments: {
    objectId: "home-button-1",
    hovered: true
  }
})
```

---

### Workflow 3: Creating an Animated Presentation

**Goal:** Build a sequence of animated cards for a presentation.

```typescript
// Step 1: Create a series of cards
const cards = [
  { title: "Introduction", subtitle: "Welcome", position: [0, 1.5, 0] },
  { title: "Problem", subtitle: "Current Challenges", position: [1.2, 1.5, 0] },
  { title: "Solution", subtitle: "Our Approach", position: [2.4, 1.5, 0] }
]

// Create all cards (repeat for each)
// ... create_object calls ...

// Step 2: Hide all except the first
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "edit_object",
  arguments: {
    objectId: "card_2_id",
    visible: false
  }
})

// Step 3: Reveal cards one by one with animations
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "edit_object",
  arguments: {
    objectId: "card_2_id",
    visible: true
  }
})

use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "trigger_animation",
  arguments: {
    objectId: "card_2_id",
    animation: "pulse",
    params: { intensity: 1.5, duration: 800 }
  }
})
```

---

### Workflow 4: Exploring and Modifying Existing Scene

**Goal:** Find and modify built-in UI elements.

```typescript
// Step 1: Get all registered objects
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "get_registered_objects",
  arguments: {}
})

// Step 2: Get details of a specific object
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "get_object",
  arguments: {
    objectId: "home-card-1"  // From registered objects list
  }
})

// Step 3: Modify its material
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "set_material_params",
  arguments: {
    objectId: "home-card-1",
    transmission: 0.95,
    roughness: 0.05,
    color: "#FF6B9D",
    emissiveIntensity: 0.4
  }
})

// Step 4: Trigger an animation
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "trigger_animation",
  arguments: {
    objectId: "home-card-1",
    animation: "glow",
    params: { color: "#FF6B9D", intensity: 1.0 }
  }
})
```

---

## Common Patterns

### Pattern 1: Create-Store-Modify Pattern

**Always store object IDs from create responses:**

```typescript
// ❌ BAD: Not storing the ID
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "create_object",
  arguments: { type: "GlassCard", position: [0, 1, 0] }
})
// Now you can't reference it!

// ✅ GOOD: Store the ID from the response
const createResponse = use_mcp_tool({...})
// Response: { success: true, objectId: "mcp_1234567890_abc123", ... }
// Use "mcp_1234567890_abc123" in subsequent calls
```

---

### Pattern 2: Batch Operations

**Create multiple objects, then style them:**

```typescript
// Create all objects first
const objectIds = []
for (position of positions) {
  const response = use_mcp_tool({
    server_name: "three-split-mcp-server",
    tool_name: "create_object",
    arguments: { type: "GlassCard", position }
  })
  objectIds.push(response.objectId)
}

// Then apply materials
for (id of objectIds) {
  use_mcp_tool({
    server_name: "three-split-mcp-server",
    tool_name: "set_material",
    arguments: { objectId: id, preset: "frosted" }
  })
}
```

---

### Pattern 3: Inspect-Before-Modify

**Always check current state before making changes:**

```typescript
// Get current state
const snapshot = use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "scene_snapshot",
  arguments: {}
})

// Find objects in the current node
const currentObjects = snapshot.objects.filter(
  obj => obj.parentNode === snapshot.currentNode
)

// Make informed decisions based on state
if (currentObjects.length > 5) {
  // Don't create more objects, modify existing ones
}
```

---

### Pattern 4: Progressive Enhancement

**Build scenes incrementally:**

```typescript
// 1. Start simple
use_mcp_tool({...}) // Create basic card

// 2. Verify it looks right
use_mcp_tool({ tool_name: "get_object", ... })

// 3. Enhance
use_mcp_tool({ tool_name: "set_material", ... })

// 4. Animate
use_mcp_tool({ tool_name: "trigger_animation", ... })
```

---

### Pattern 5: Coordinate System Reference

**Understanding 3D positions:**

```
Y (up/down)
│
│     Z (depth - toward/away from camera)
│    ╱
│   ╱
│  ╱
│ ╱
│╱_________ X (left/right)
```

**Common positions:**
- Center: `[0, 0, 0]`
- Front center: `[0, 1.5, 0]` (typical for cards)
- Left side: `[-2, 1, 0]`
- Right side: `[2, 1, 0]`
- Above: `[0, 2.5, 0]`

**Rotation (in radians):**
- 45 degrees: `0.785`
- 90 degrees: `1.571`
- 180 degrees: `3.142`
- 360 degrees: `6.283`

---

## Troubleshooting

### Issue: "Object not found"

**Cause:** Trying to modify an object that doesn't exist or was deleted.

**Solution:**
```typescript
// Always verify object exists first
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "get_object",
  arguments: { objectId: "mcp_1234567890_abc123" }
})
```

---

### Issue: "Validation error: color must be a valid hex color"

**Cause:** Invalid color format.

**Solution:**
```typescript
// ❌ BAD
color: "red"
color: "rgb(255, 0, 0)"

// ✅ GOOD
color: "#FF0000"
color: "#4A90D9"
```

---

### Issue: "Validation error: transmission: Number must be less than or equal to 1"

**Cause:** Value out of range.

**Solution:**
```typescript
// ❌ BAD
transmission: 1.5

// ✅ GOOD
transmission: 0.95  // Must be between 0 and 1
```

---

### Issue: Objects appear in wrong location

**Cause:** Incorrect coordinate system understanding.

**Solution:**
```typescript
// Get the current snapshot to see other objects' positions
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "scene_snapshot",
  arguments: {}
})

// Use relative positioning based on existing objects
// If an object is at [0, 1.5, 0], place new one at [1.2, 1.5, 0] (to the right)
```

---

### Issue: Animation doesn't trigger

**Cause:** Animation might only work on registered objects, not dynamic ones.

**Solution:**
```typescript
// Check if object is registered
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "get_registered_objects",
  arguments: {}
})

// Use animations only on registered objects (built-in UI elements)
```

---

### Issue: Material changes don't appear

**Cause:** Object might not support material changes, or changes are too subtle.

**Solution:**
```typescript
// Make dramatic changes to test
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "set_material",
  arguments: {
    objectId: "mcp_1234567890_abc123",
    transmission: 0.1,  // Very opaque
    color: "#FF0000"    // Bright red
  }
})
```

---

## Best Practices

### 1. **Start with a Snapshot**
Always begin by getting a scene snapshot to understand the current state.

### 2. **Store Object IDs**
Keep track of created object IDs for later modification.

### 3. **Use Meaningful Names**
When creating objects, use descriptive properties that help identify them later.

### 4. **Test Incrementally**
Create one object, verify it, then create more. Don't bulk-create without testing.

### 5. **Use Presets First**
Start with material presets before fine-tuning individual properties.

### 6. **Understand Object Types**
- **Registered Objects**: Built-in UI, support animations, persistent
- **Dynamic Objects**: Created via MCP, temporary, limited animation support

### 7. **Coordinate Planning**
Sketch out object positions before creating them to avoid overlaps.

### 8. **Clean Up**
Delete objects you no longer need to keep the scene manageable.

### 9. **Node Organization**
Group related objects in the same scene node for easier management.

### 10. **Error Handling**
Always check tool responses for success/error status before proceeding.

---

## Quick Reference Card

### Essential Tools
| Tool | Use Case |
|------|----------|
| `scene_snapshot` | Get current state |
| `create_object` | Add new objects |
| `edit_object` | Move/rotate/scale |
| `set_material` | Change appearance |
| `delete_object` | Remove objects |
| `trigger_animation` | Animate objects |
| `navigate_to` | Move camera |

### Object Types
- **GlassCard**: Text display panels
- **GlassButton**: Interactive buttons
- **GlassPanel**: Large background panels
- **Box/Sphere/Cylinder**: Basic 3D primitives
- **Text3D**: 3D text

### Material Presets
- `standard`: Default balanced look
- `frosted`: Blurred, matte glass
- `clear`: Highly transparent
- `tinted`: Colored glass
- `highContrast`: Opaque and rough

### Common Animations
- `pulse`: Scaling pulse
- `ripple`: Water ripple
- `glow`: Emissive glow
- `shake`: Vibrate effect

---

## Examples Library

### Example 1: Welcome Screen

```typescript
// Navigate to home
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "navigate_to",
  arguments: { node: "home" }
})

// Create title card
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "create_object",
  arguments: {
    type: "GlassCard",
    position: [0, 1.8, 0],
    properties: {
      title: "Welcome",
      subtitle: "Three Split Demo",
      width: 1.2,
      height: 0.4
    }
  }
})

// Create navigation buttons
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "create_object",
  arguments: {
    type: "GlassButton",
    position: [0, 1.0, 0],
    properties: {
      label: "Get Started"
    }
  }
})
```

---

### Example 2: Data Visualization

```typescript
// Create a bar chart using scaled boxes
const data = [0.5, 0.8, 0.6, 0.9, 0.7]

for (let i = 0; i < data.length; i++) {
  use_mcp_tool({
    server_name: "three-split-mcp-server",
    tool_name: "create_object",
    arguments: {
      type: "Box",
      position: [-1 + i * 0.5, data[i] / 2, 0],
      scale: [0.3, data[i], 0.3],
      properties: {
        color: "#4A90D9"
      }
    }
  })
}
```

---

### Example 3: Interactive Gallery

```typescript
// Create a grid of cards
const positions = [
  [-1, 1.5, 0], [0, 1.5, 0], [1, 1.5, 0],
  [-1, 0.8, 0], [0, 0.8, 0], [1, 0.8, 0]
]

for (let i = 0; i < positions.length; i++) {
  use_mcp_tool({
    server_name: "three-split-mcp-server",
    tool_name: "create_object",
    arguments: {
      type: "GlassCard",
      position: positions[i],
      properties: {
        title: `Item ${i + 1}`,
        subtitle: "Click to explore"
      }
    }
  })
}
```

---

## Advanced Topics

### Custom Animation Choreography

Create complex animation sequences by chaining animations:

```typescript
// 1. Create object
const id = "mcp_1234567890_abc123"

// 2. Pulse
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "trigger_animation",
  arguments: {
    objectId: id,
    animation: "pulse",
    params: { duration: 500 }
  }
})

// 3. Wait, then glow
// (Note: You'll need to handle timing in your implementation)
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "trigger_animation",
  arguments: {
    objectId: id,
    animation: "glow",
    params: { color: "#4A90D9", duration: 1000 }
  }
})
```

---

### Dynamic Material Transitions

Smoothly transition between material states:

```typescript
// Start with clear glass
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "set_material",
  arguments: {
    objectId: id,
    preset: "clear"
  }
})

// Transition to frosted
// (Material changes are instant, but you can combine with animations)
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "set_material",
  arguments: {
    objectId: id,
    preset: "frosted"
  }
})
```

---

## Summary

The Three Split MCP Server provides a powerful interface for creating and manipulating 3D glass morphism scenes. By following the workflows and patterns in this guide, you can:

✅ Build interactive 3D presentations
✅ Create dynamic data visualizations
✅ Prototype glass UI designs
✅ Choreograph complex animations
✅ Explore and modify existing scenes

**Remember:** Always start with `scene_snapshot`, store object IDs, and test incrementally!

---

**Need Help?**
- Check the [Troubleshooting](#troubleshooting) section
- Review the [Examples Library](#examples-library)
- Examine the [Common Patterns](#common-patterns)

**Happy Building! 🚀**
