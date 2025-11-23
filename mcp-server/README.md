# Three Split MCP Server

Model Context Protocol server for editing 3D scenes in the Liquid Glass website.

## Overview

This MCP server enables Claude Desktop to interact with the Three Split 3D scene:

- **View** current scene state (camera, objects, nodes)
- **Create** new 3D objects (glass panels, cards, buttons, primitives)
- **Edit** object transforms and properties
- **Delete** objects
- **Navigate** between scene nodes
- **Modify** glass material properties

## Installation

```bash
cd mcp-server
npm install
npm run build
```

## Claude Desktop Configuration

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "three-split-scene": {
      "command": "node",
      "args": ["/absolute/path/to/three_split/mcp-server/dist/index.js"],
      "env": {
        "SCENE_WS_URL": "ws://localhost:3001"
      }
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `scene_snapshot` | Get complete scene state as JSON |
| `list_objects` | List all objects (filterable by node/type) |
| `get_object` | Get details for a specific object |
| `create_object` | Create new 3D object |
| `edit_object` | Modify object transform/properties |
| `delete_object` | Remove object from scene |
| `navigate_to` | Move camera to node or position |
| `set_material` | Change object's glass material |

## Object Types

### Glass Components
- `GlassPanel` - Base glass surface
- `GlassCard` - Card with title/subtitle
- `GlassButton` - Interactive button

### Primitives
- `Box` - Rectangular box
- `Sphere` - Sphere
- `Cylinder` - Cylinder
- `Text3D` - 3D text

## Example Usage

### View Scene
```
Use scene_snapshot to see the current state of the 3D scene
```

### Create Object
```
Create a GlassCard at position [1, 1.5, 0] with title "Hello" and subtitle "World"
```

### Edit Object
```
Move object nav_consulting to position [-2, 1, -1]
```

### Change Material
```
Set the material of hero_panel to frosted preset
```

## Development

```bash
# Watch mode
npm run dev

# Build
npm run build

# Start server
npm start
```

## Architecture

```
mcp-server/
├── src/
│   ├── index.ts           # MCP server entry point
│   ├── bridge/
│   │   └── websocket.ts   # WebSocket connection to React app
│   └── tools/
│       ├── scene.ts       # Scene inspection tools
│       ├── objects.ts     # Object CRUD tools
│       ├── navigation.ts  # Camera navigation
│       └── materials.ts   # Material editing
└── package.json
```

## Requirements

- Node.js 18+
- Three Split React app running with WebSocket bridge (port 3001)
- Claude Desktop with MCP support

## See Also

- [MCP Server Specification](../docs/MCP_SERVER.md) - Full technical specification
- [Component Library](../docs/COMPONENT_LIBRARY.md) - Available glass components
- [Animation System](../docs/ANIMATION_SYSTEM.md) - Motion and transitions
