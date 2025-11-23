# MCP Server for 3D Scene Editing

## Overview

This document specifies the Model Context Protocol (MCP) server that enables Claude Desktop to interact with the Liquid Glass 3D scene. The MCP server allows Claude to:

1. **See** the current scene state (objects, positions, materials)
2. **Create** new 3D objects and place them in the scene
3. **Edit** existing objects (transform, material, visibility)
4. **Delete** objects from the scene
5. **Query** scene information and object properties

---

## Architecture

```
┌─────────────────┐     MCP Protocol      ┌──────────────────┐
│  Claude Desktop │ ◄──────────────────► │   MCP Server     │
└─────────────────┘                       │   (Node.js)      │
                                          └────────┬─────────┘
                                                   │
                                          WebSocket/HTTP
                                                   │
                                          ┌────────▼─────────┐
                                          │  React App       │
                                          │  (Three.js)      │
                                          └──────────────────┘
```

### Components

1. **MCP Server** (`mcp-server/`): Node.js server implementing MCP protocol
2. **Scene Bridge** (`src/mcp/`): Client-side code connecting React app to MCP server
3. **Scene State Store**: Zustand store extended with scene object management

---

## MCP Tools

### 1. `scene_snapshot`
Get a JSON representation of the current scene.

**Parameters**: None

**Returns**:
```json
{
  "camera": {
    "position": [0, 1.5, 4],
    "lookAt": [0, 1.2, 0]
  },
  "currentNode": "home",
  "objects": [
    {
      "id": "obj_001",
      "type": "GlassPanel",
      "position": [0, 1.2, 0],
      "rotation": [0, 0, 0],
      "scale": [1, 1, 1],
      "properties": {
        "width": 2.0,
        "height": 1.2,
        "material": "standard"
      }
    }
  ]
}
```

---

### 2. `create_object`
Create a new 3D object in the scene.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| type | string | Yes | Object type: `GlassPanel`, `GlassCard`, `GlassButton`, `Sphere`, `Box`, `Cylinder`, `Text3D`, `Custom` |
| position | [x, y, z] | Yes | World position |
| rotation | [x, y, z] | No | Euler rotation in radians (default: [0,0,0]) |
| scale | [x, y, z] | No | Scale factor (default: [1,1,1]) |
| properties | object | No | Type-specific properties |
| parentNode | string | No | Which scene node to attach to (default: current) |

**Example**:
```json
{
  "type": "GlassCard",
  "position": [1.5, 1.0, 0],
  "rotation": [0, -0.2, 0],
  "properties": {
    "title": "New Project",
    "subtitle": "Created via MCP",
    "width": 0.8,
    "height": 0.5
  },
  "parentNode": "home"
}
```

**Returns**:
```json
{
  "success": true,
  "objectId": "obj_002",
  "message": "Created GlassCard at [1.5, 1.0, 0]"
}
```

---

### 3. `edit_object`
Modify an existing object's properties.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| objectId | string | Yes | ID of object to edit |
| position | [x, y, z] | No | New position |
| rotation | [x, y, z] | No | New rotation |
| scale | [x, y, z] | No | New scale |
| properties | object | No | Properties to update |
| visible | boolean | No | Show/hide object |

**Example**:
```json
{
  "objectId": "obj_002",
  "position": [2.0, 1.2, 0.5],
  "properties": {
    "title": "Updated Title"
  }
}
```

---

### 4. `delete_object`
Remove an object from the scene.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| objectId | string | Yes | ID of object to delete |

---

### 5. `list_objects`
List all dynamic objects in the scene.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| node | string | No | Filter by scene node |
| type | string | No | Filter by object type |

---

### 6. `get_object`
Get detailed information about a specific object.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| objectId | string | Yes | ID of object |

---

### 7. `navigate_to`
Move camera to a specific node or position.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| node | string | No | Node ID: `home`, `consulting`, `software`, `construction`, `contact` |
| position | [x, y, z] | No | Custom camera position |
| lookAt | [x, y, z] | No | Custom look-at target |

---

### 8. `set_material`
Change an object's material properties.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| objectId | string | Yes | ID of object |
| preset | string | No | Material preset: `standard`, `frosted`, `clear`, `tinted` |
| transmission | number | No | 0-1 |
| roughness | number | No | 0-1 |
| color | string | No | Hex color for tint |

---

## MCP Resources

### `scene://current`
Returns the current scene state as a resource.

### `scene://objects/{objectId}`
Returns a specific object's data.

### `scene://nodes`
Returns list of available scene nodes.

---

## Implementation Plan

### Phase 1: MCP Server Foundation
- [ ] Set up MCP server with `@modelcontextprotocol/sdk`
- [ ] Implement basic tool stubs
- [ ] Create WebSocket connection to React app
- [ ] Test connection with Claude Desktop

### Phase 2: Scene State Sync
- [ ] Extend Zustand store with `sceneObjects` state
- [ ] Create SceneBridge component for WebSocket client
- [ ] Implement `scene_snapshot` tool
- [ ] Implement `list_objects` and `get_object` tools

### Phase 3: Object Creation
- [ ] Implement `create_object` tool
- [ ] Create DynamicObject component for rendering MCP-created objects
- [ ] Support all glass component types
- [ ] Support primitive shapes (Box, Sphere, Cylinder)

### Phase 4: Object Editing
- [ ] Implement `edit_object` tool
- [ ] Implement `delete_object` tool
- [ ] Implement `set_material` tool
- [ ] Add real-time property updates

### Phase 5: Navigation & Polish
- [ ] Implement `navigate_to` tool
- [ ] Add MCP resources
- [ ] Error handling and validation
- [ ] Documentation and examples

---

## File Structure

```
three_split/
├── mcp-server/
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts          # MCP server entry
│   │   ├── tools/
│   │   │   ├── scene.ts      # scene_snapshot, list_objects
│   │   │   ├── objects.ts    # create, edit, delete
│   │   │   ├── navigation.ts # navigate_to
│   │   │   └── materials.ts  # set_material
│   │   ├── resources/
│   │   │   └── scene.ts      # MCP resources
│   │   └── bridge/
│   │       └── websocket.ts  # WebSocket to React app
│   └── README.md
├── src/
│   ├── mcp/
│   │   ├── SceneBridge.tsx   # WebSocket client component
│   │   ├── DynamicObject.tsx # Renders MCP-created objects
│   │   └── types.ts          # Shared types
│   └── store/
│       └── index.ts          # Extended with scene objects
└── docs/
    └── MCP_SERVER.md         # This document
```

---

## Claude Desktop Configuration

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "three-split-scene": {
      "command": "node",
      "args": ["/path/to/three_split/mcp-server/dist/index.js"],
      "env": {
        "SCENE_WS_URL": "ws://localhost:3001"
      }
    }
  }
}
```

---

## Usage Examples

### Creating a floating info card
```
Use the create_object tool to add a GlassCard at position [2, 1.5, -1]
with title "Welcome" and subtitle "Interactive 3D Scene"
```

### Rearranging scene layout
```
First use scene_snapshot to see current objects, then use edit_object
to move the consulting card to position [-2, 1, 0]
```

### Building a custom display
```
Create a GlassPanel at [0, 2, -2], then add three GlassButtons
below it for navigation options
```

---

## Security Considerations

- MCP server only runs locally
- WebSocket connection restricted to localhost
- Object IDs are validated before operations
- Rate limiting on create/edit operations
- Scene state changes are reversible (undo support planned)

---

*This MCP server enables AI-assisted 3D scene editing, bridging Claude's capabilities with real-time 3D visualization.*
