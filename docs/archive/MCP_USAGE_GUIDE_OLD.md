# Three Split MCP Server - Complete Usage Guide

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Available Tools](#available-tools)
4. [Tool Categories](#tool-categories)
5. [Common Workflows](#common-workflows)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## System Overview

The Three Split MCP Server provides **Claude Desktop with direct control** over a 3D Liquid Glass website built with React Three Fiber. The system enables:

- **Scene Inspection**: View all objects, camera position, and current state
- **Object Control**: Modify materials, positions, and properties of glass components
- **Animation Triggers**: Animate buttons, cards, and panels with liquid glass effects
- **Navigation**: Move between scene nodes (home, consulting, software, construction, contact)
- **Dynamic Creation**: Spawn new 3D objects in the scene

### Two Types of Objects

1. **Registered Objects** (Static Components)
   - Built-in React components (GlassButton, GlassCard, GlassPanel)
   - Auto-register on mount with the SceneRegistry
   - IDs format: `glasscard_2_midd784l`
   - Query with: `get_registered_objects`
   - Control with: `set_material`, `set_material_params`, `trigger_animation`

2. **Dynamic Objects** (MCP-Created)
   - Created via `create_object` tool
   - Stored in scene state
   - IDs format: `mcp_1234567890_abc123`
   - Query with: `list_objects`
   - Control with: `edit_object`, `delete_object`, `set_material`

---

## Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│ Claude Desktop  │ ◄─────► │  Relay Server   │ ◄─────► │   React App     │
│   (MCP Client)  │  stdio  │  (ws://3001)    │   ws    │ (localhost:5173)│
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                                                 │
                                                                 ▼
                                                         ┌─────────────────┐
                                                         │ SceneRegistry   │
                                                         │ (All Objects)   │
                                                         └─────────────────┘
```

**Key Components:**
- **MCP Server** (`mcp-server/src/index.ts`) - Stdio transport to Claude Desktop
- **Relay Server** (`mcp-server/relay.js`) - WebSocket message broker
- **SceneBridge** (`src/mcp/SceneBridge.tsx`) - React-side message handler
- **SceneRegistry** (`src/registry/SceneRegistry.ts`) - Object tracking system

---

## Available Tools

### 1. Scene Inspection Tools

#### `scene_snapshot`
**Purpose**: Get complete scene state including camera, objects, and navigation.

**Input**: None (empty object `{}`)

**Output**:
```json
{
  "camera": {
    "position": [0, 1.5, 4],
    "lookAt": [0, 1.2, 0]
  },
  "currentNode": "home",
  "isTransitioning": false,
  "objects": [],  // Dynamic objects
  "registeredObjects": [  // Static components
    {
      "id": "glasscard_2_midd784l",
      "type": "GlassCard",
      "name": "Consulting",
      "position": [-1.5, 0.8, -1.2],
      "rotation": [0, 0.2, 0],
      "scale": [1, 1, 1],
      "parentNode": "global",
      "visible": true,
      "properties": {
        "title": "Consulting",
        "subtitle": "Streamline operations"
      },
      "animationState": {
        "hovered": false,
        "pressed": false,
        "loading": false,
        "disabled": false
      },
      "materialState": {
        "roughness": 0.1,
        "transmission": 0.92
      }
    }
  ]
}
```

**When to use**:
- Start of every session to understand scene layout
- Before making changes to verify object IDs
- To check current camera position and node

---

#### `get_registered_objects`
**Purpose**: List all static React components (buttons, cards, panels).

**Input**:
```json
{
  "node": "home",     // Optional: filter by parent node
  "type": "GlassCard" // Optional: filter by object type
}
```

**Output**: Array of registered objects (same format as `registeredObjects` in snapshot)

**When to use**:
- To find specific UI elements (navigation cards, buttons)
- To get object IDs for manipulation
- To see what's available in the current node

**Example**:
```json
// Get all cards
{ "type": "GlassCard" }

// Get all objects in home node
{ "node": "home" }

// Get everything
{}
```

---

#### `list_objects`
**Purpose**: List dynamic objects created via MCP.

**Input**:
```json
{
  "node": "home",     // Optional: filter by parent node
  "type": "Box"       // Optional: filter by type
}
```

**Output**: Array of dynamic objects

**When to use**:
- To see what you've created via `create_object`
- To get IDs of dynamic objects for editing/deletion
- Does NOT return registered static components

---

#### `get_object`
**Purpose**: Get detailed info about a specific object (works for both types).

**Input**:
```json
{
  "objectId": "glasscard_2_midd784l"
}
```

**Output**: Full object details or `null` if not found

**When to use**:
- To check current state of a specific object
- To verify an object exists before modifying it

---

### 2. Material Control Tools

#### `set_material` ⭐ PRIMARY MATERIAL TOOL
**Purpose**: Change glass material properties (works for ALL objects).

**Input**:
```json
{
  "objectId": "glasscard_2_midd784l",
  "color": "#4A90E2",           // Hex color (tints glass)
  "transmission": 0.85,          // 0-1 (0=opaque, 1=transparent)
  "roughness": 0.15,             // 0-1 (0=mirror, 1=frosted)
  "ior": 1.5                     // Index of refraction (1.45 typical glass)
}
```

**All parameters are optional** - only include what you want to change.

**Output**:
```json
{
  "success": true,
  "message": "Material updated (registered object)"
}
```

**When to use**:
- Changing glass colors/tints
- Adjusting transparency
- Making glass shinier or more frosted
- **This is the main tool for visual changes**

**Important Notes**:
- Works on BOTH registered and dynamic objects
- Checks `SceneRegistry` first, then falls back to dynamic objects
- Color changes also affect attenuation and emissive for proper glass glow
- Changes are instant and visible immediately

**Examples**:
```json
// Make a card blue and more transparent
{
  "objectId": "glasscard_2_midd784l",
  "color": "#0066FF",
  "transmission": 0.95
}

// Make glass frosted
{
  "objectId": "glasspanel_1_midd784l",
  "roughness": 0.35
}

// Just change color
{
  "objectId": "glasscard_3_midd784l",
  "color": "#10B981"
}
```

---

#### `set_material_params` (Advanced)
**Purpose**: Fine-grained control of material properties (registered objects only).

**Input**:
```json
{
  "objectId": "glasscard_2_midd784l",
  "params": {
    "transmission": 0.92,
    "roughness": 0.08,
    "ior": 1.5,
    "emissiveIntensity": 0.3,    // Glow intensity
    "envMapIntensity": 1.5,       // Environment reflection
    "clearcoat": 0.4,             // Clear coating layer
    "color": "#FF6B6B"
  }
}
```

**When to use**:
- Need control over emissive intensity, clearcoat, etc.
- Creating specific visual effects
- **For basic changes, use `set_material` instead**

---

#### `get_material_params`
**Purpose**: Read current material properties of a registered object.

**Input**:
```json
{
  "objectId": "glasscard_2_midd784l"
}
```

**Output**:
```json
{
  "objectId": "glasscard_2_midd784l",
  "params": {
    "transmission": 0.92,
    "roughness": 0.1,
    "ior": 1.45,
    "color": "#4A90E2"
  }
}
```

**When to use**:
- Check current material state before modifications
- Debugging visual issues

---

### 3. Animation Tools

#### `trigger_animation`
**Purpose**: Trigger liquid glass animations on objects.

**Input**:
```json
{
  "objectId": "glassbutton_5_midd784l",
  "animation": "ripple",
  "params": {
    "intensity": 0.8,
    "duration": 600,
    "color": "#4A90E2",
    "origin": [0.5, 0.5]  // UV coordinates for ripple
  }
}
```

**Available Animations by Type**:

**GlassButton:**
- `pulse` - Idle pulsing glow
- `ripple` - Touch ripple effect
- `glow` - Emissive glow pulse
- `liquidDeform` - Organic deformation
- `fresnelShift` - Edge glow effect
- `refractionWave` - IOR wave on click
- `shake` - Quick shake animation
- `fadeIn`, `fadeOut` - Opacity transitions

**GlassCard:**
- `pulse`, `fadeIn`, `fadeOut`, `shake` (base)
- `flip` - Card flip animation
- `tilt` - Tilt effect
- `reveal` - Reveal animation

**GlassPanel:**
- `pulse`, `fadeIn`, `fadeOut`, `shake` (base)
- `shimmer` - Shimmer wave
- `wave` - Wave animation

**When to use**:
- Creating visual feedback
- Drawing attention to elements
- Interactive demonstrations

**Examples**:
```json
// Trigger ripple on button click
{
  "objectId": "glassbutton_5_midd784l",
  "animation": "ripple",
  "params": { "color": "#00FF00" }
}

// Make a card glow
{
  "objectId": "glasscard_2_midd784l",
  "animation": "glow",
  "params": { "intensity": 0.5 }
}

// Simple pulse (no params needed)
{
  "objectId": "glasspanel_1_midd784l",
  "animation": "pulse"
}
```

---

#### `list_animations`
**Purpose**: Get available animations for an object or type.

**Input**:
```json
{
  "objectId": "glassbutton_5_midd784l"  // OR
  "type": "GlassButton"                  // OR
  // Empty for all animations
}
```

**Output**:
```json
{
  "objectId": "glassbutton_5_midd784l",
  "type": "GlassButton",
  "animations": [
    "pulse", "ripple", "glow", "liquidDeform",
    "fresnelShift", "refractionWave", "shake",
    "fadeIn", "fadeOut"
  ]
}
```

**When to use**:
- Discovering what animations are available
- Before calling `trigger_animation`

---

#### `set_animation_state`
**Purpose**: Control animation state (simulate hover, press, loading).

**Input**:
```json
{
  "objectId": "glassbutton_5_midd784l",
  "hovered": true,    // Optional
  "pressed": false,   // Optional
  "loading": false,   // Optional
  "disabled": false   // Optional
}
```

**When to use**:
- Simulating user interactions
- Testing hover/press states
- Setting loading state on buttons

---

#### `get_animation_state`
**Purpose**: Read current animation state.

**Input**:
```json
{
  "objectId": "glassbutton_5_midd784l"
}
```

**Output**:
```json
{
  "objectId": "glassbutton_5_midd784l",
  "state": {
    "idle": true,
    "hovered": false,
    "pressed": false,
    "loading": false,
    "disabled": false,
    "currentScale": [1, 1, 1],
    "currentEmissiveIntensity": 0.15,
    "currentRoughness": 0.08
  }
}
```

---

### 4. Object Creation & Management

#### `create_object`
**Purpose**: Spawn new 3D objects in the scene.

**Input**:
```json
{
  "type": "Box",  // Box, Sphere, Cylinder, GlassButton, etc.
  "position": [0, 1, 0],
  "rotation": [0, 0, 0],      // Optional
  "scale": [1, 1, 1],         // Optional
  "properties": {             // Optional, type-specific
    "label": "Click Me",
    "variant": "primary"
  },
  "parentNode": "home"        // Optional, defaults to current
}
```

**Output**:
```json
{
  "success": true,
  "objectId": "mcp_1234567890_abc123",
  "message": "Created Box"
}
```

**When to use**:
- Adding new elements to the scene
- Creating temporary markers or indicators
- Building dynamic UI elements

---

#### `edit_object`
**Purpose**: Modify dynamic objects (position, scale, rotation, visibility).

**Input**:
```json
{
  "objectId": "mcp_1234567890_abc123",
  "position": [0, 2, 0],      // Optional
  "rotation": [0, 0.5, 0],    // Optional
  "scale": [1.5, 1.5, 1.5],   // Optional
  "visible": true,            // Optional
  "properties": {}            // Optional
}
```

**When to use**:
- Moving objects
- Animating object transforms
- Hiding/showing objects

---

#### `delete_object`
**Purpose**: Remove dynamic objects from the scene.

**Input**:
```json
{
  "objectId": "mcp_1234567890_abc123"
}
```

**When to use**:
- Cleaning up temporary objects
- Removing test elements

---

### 5. Navigation Tools

#### `navigate_to`
**Purpose**: Move camera to different scene nodes.

**Input**:
```json
{
  "node": "consulting"  // home, consulting, software, construction, contact
}
```

**Output**:
```json
{
  "success": true,
  "message": "Navigating to consulting"
}
```

**When to use**:
- Switching between pages/sections
- Showcasing different parts of the site
- Testing navigation transitions

**Important**: Navigation triggers smooth camera animations. Check `isTransitioning` in snapshot.

---

## Tool Categories

### Quick Reference Table

| Task | Tool | Works On |
|------|------|----------|
| See everything | `scene_snapshot` | N/A |
| List static UI | `get_registered_objects` | Registered |
| List created objects | `list_objects` | Dynamic |
| Change colors | `set_material` | **Both** ⭐ |
| Animate | `trigger_animation` | Registered |
| Create object | `create_object` | Creates dynamic |
| Move object | `edit_object` | Dynamic |
| Navigate pages | `navigate_to` | N/A |

---

## Common Workflows

### Workflow 1: Changing Scene Colors

```javascript
// 1. Get scene snapshot to find objects
scene_snapshot({})

// 2. Identify objects from registeredObjects array
// Look for objects like: "glasscard_2_midd784l"

// 3. Change colors
set_material({
  "objectId": "glasscard_2_midd784l",
  "color": "#FF6B6B",
  "transmission": 0.88
})

set_material({
  "objectId": "glasscard_3_midd784l",
  "color": "#4ECDC4"
})

// 4. Verify changes visually in browser
```

### Workflow 2: Creating Interactive Buttons

```javascript
// 1. Get current scene state
scene_snapshot({})

// 2. Create a button
create_object({
  "type": "GlassButton",
  "position": [0, 1.5, 0],
  "properties": {
    "label": "Click Me!",
    "variant": "primary",
    "size": "lg"
  }
})
// Returns: {"objectId": "mcp_1234567890_abc123"}

// 3. Trigger animation on it
trigger_animation({
  "objectId": "mcp_1234567890_abc123",
  "animation": "pulse"
})

// 4. Change its color
set_material({
  "objectId": "mcp_1234567890_abc123",
  "color": "#FFD700"
})
```

### Workflow 3: Showcasing Navigation

```javascript
// 1. Start at home
navigate_to({"node": "home"})

// 2. Navigate through sections
navigate_to({"node": "consulting"})
// Wait for transition...

navigate_to({"node": "software"})
// Wait for transition...

navigate_to({"node": "construction"})
```

### Workflow 4: Creating a Color Theme

```javascript
// Define a color palette
const colors = {
  primary: "#4A90E2",
  secondary: "#7C3AED",
  accent: "#10B981"
}

// Get all cards
get_registered_objects({"type": "GlassCard"})

// Apply colors to each card
set_material({
  "objectId": "glasscard_2_midd784l",  // Consulting
  "color": colors.primary,
  "roughness": 0.12
})

set_material({
  "objectId": "glasscard_3_midd784l",  // Software
  "color": colors.secondary,
  "roughness": 0.12
})

set_material({
  "objectId": "glasscard_4_midd784l",  // Construction
  "color": colors.accent,
  "roughness": 0.12
})
```

---

## Best Practices

### DO ✅

1. **Always start with `scene_snapshot`** to understand the current state
2. **Use `set_material` for visual changes** - it works on everything
3. **Include only the parameters you want to change** - all params are optional
4. **Use descriptive names** when creating objects with `create_object`
5. **Clean up dynamic objects** with `delete_object` when done
6. **Check `isTransitioning`** before navigating again
7. **Use hex colors** for glass tinting (e.g., `#4A90E2`)
8. **Keep transmission between 0.85-0.95** for best glass effect
9. **Keep roughness between 0.05-0.20** for liquid glass look

### DON'T ❌

1. **Don't use `list_objects` to find static UI** - use `get_registered_objects`
2. **Don't set transmission below 0.7** - glass will look too opaque
3. **Don't modify position/rotation of registered objects** - they're fixed in React
4. **Don't spam `navigate_to`** - wait for transitions to complete
5. **Don't forget to specify `objectId`** - it's required for all object operations
6. **Don't try to edit registered objects with `edit_object`** - only works on dynamic objects
7. **Don't set roughness above 0.4** unless you want frosted glass

---

## Troubleshooting

### Objects Not Changing

**Problem**: Called `set_material` but nothing changed in the browser.

**Solutions**:
1. Verify object ID is correct with `scene_snapshot`
2. Check relay server is running (`node relay.js`)
3. Check React app is running (`npm run dev`)
4. Verify relay shows `Total clients: 2` or `3`
5. Pull latest code: `git pull origin claude/build-knowledge-base-01Q1q2zvXDzBacj7rpewizHJ`

### Request Timeout

**Problem**: Getting `Error: Request timeout` responses.

**Solutions**:
1. Check relay server is running
2. Check React app connected (relay should show client connections)
3. Restart MCP server in Claude Desktop
4. Verify WebSocket port 3001 is not blocked

### Can't Find Objects

**Problem**: `list_objects` returns empty array.

**Solution**: Use `get_registered_objects` instead - `list_objects` only shows dynamic objects you've created.

### Colors Look Wrong

**Problem**: Glass looks too dark or wrong color.

**Solutions**:
1. Ensure `transmission` is between 0.85-0.95
2. Use lighter colors (e.g., `#6B8EFF` instead of `#000080`)
3. Check `roughness` isn't too high (keep under 0.2)
4. Try adding `emissiveIntensity: 0.2` for glow

### Animations Not Working

**Problem**: `trigger_animation` succeeds but no animation visible.

**Solutions**:
1. Check object type supports that animation with `list_animations`
2. Verify object is a registered component (buttons/cards/panels)
3. Some animations are subtle - try `"pulse"` or `"glow"` first
4. Check object is visible and on screen

---

## Object ID Patterns

Registered objects follow this pattern:
- `glasspanel_[number]_[random]` - GlassPanel components
- `glasscard_[number]_[random]` - GlassCard components
- `glassbutton_[number]_[random]` - GlassButton components

Dynamic objects follow this pattern:
- `mcp_[timestamp]_[random]` - Created via `create_object`

---

## Performance Tips

1. **Batch operations** - Make multiple changes before checking results
2. **Avoid rapid navigation** - Let transitions complete (~800ms)
3. **Limit dynamic objects** - Create only what's needed
4. **Reuse objects** - Use `edit_object` to move instead of delete/create
5. **Use `scene_snapshot` sparingly** - It's comprehensive but large

---

## Summary Quick Start

**Every Session Should Start With:**

```javascript
// 1. Get the scene layout
scene_snapshot({})

// 2. Identify objects you want to control
get_registered_objects({})

// 3. Make changes
set_material({
  "objectId": "glasscard_2_midd784l",
  "color": "#4A90E2"
})

// 4. Trigger animations (optional)
trigger_animation({
  "objectId": "glasscard_2_midd784l",
  "animation": "pulse"
})
```

**Remember**: `set_material` is your primary tool for visual changes. It works on everything and is the most reliable way to modify the scene.
