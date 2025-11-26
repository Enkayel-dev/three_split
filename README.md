# Enkayel Studios - Liquid Glass 3D Portfolio

> **"Crafting Systems, Spaces, and Software That Work as One"**

A premium, immersive 3D website built with React Three Fiber showcasing a multi-disciplinary portfolio through Apple's revolutionary Liquid Glass design aesthetic.

## Overview

This project creates a game-like 3D website where UI components (buttons, cards, toolbars) are physical 3D objects floating in space, rendered with a custom Liquid Glass material system that features real-time light refraction, dynamic blur, and fluid animations.

### Core Disciplines Showcased

- **Business Operations Consulting** - Process optimization, workflow automation, KPI dashboards
- **Custom Software Development** - Web applications, dashboards, automation tools
- **Construction & Architecture** - Design-build projects, residential and commercial

## Design Philosophy

The Liquid Glass aesthetic is built on Apple's design principles:

1. **Content First, Material Second** - Material lifts content, never competes with it
2. **Optical Plausibility** - Materials obey physical rules (refraction, Fresnel, thickness)
3. **Motion as Intent** - Every animation communicates state change semantically
4. **Adaptive & Respectful** - Honors reduced motion, transparency, and contrast preferences
5. **System Material** - Unified visual language across all components

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | React | Component-based UI logic |
| 3D Engine | React Three Fiber | Declarative Three.js integration |
| Rendering | Three.js | WebGL 3D rendering |
| Shaders | GLSL / ShaderMaterial | Custom Liquid Glass effects |
| Animation | react-spring | Fluid physics-based transitions |
| Build | Vite | Fast bundling and HMR |
| Modeling | Blender | 3D UI component creation |
| Assets | glTF/GLB | Optimized 3D model format |

## Project Structure

```
three_split/
├── docs/                          # Knowledge base & documentation
│   ├── CREATIVE_DIRECTION.md      # Design manifesto & principles
│   ├── INFORMATION_ARCHITECTURE.md # Spatial IA & navigation
│   ├── COMPONENT_LIBRARY.md       # 3D UI component specs
│   ├── SHADER_SPECIFICATION.md    # Liquid Glass material system
│   ├── TECHNICAL_ARCHITECTURE.md  # System architecture
│   ├── ASSET_PIPELINE.md          # Blender → Web workflow
│   ├── ANIMATION_SYSTEM.md        # Motion design system
│   ├── ACCESSIBILITY.md           # A11y & fallback strategies
│   ├── PERFORMANCE.md             # Optimization guidelines
│   ├── IMPLEMENTATION_PLAN.md     # Phased development roadmap
│   ├── MOCK_DATA.md               # Portfolio content & data
│   └── MVP_LAYOUT.md              # 3D scene blueprint
├── src/                           # Source code (to be created)
├── assets/                        # 3D models, textures (to be created)
└── public/                        # Static assets (to be created)
```

## Quick Start

### Standard Development

```bash
# Clone the repository
git clone <repo-url>
cd three_split

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### MCP Server Mode (AI Control)

The Three Split MCP Server enables AI assistants (like Claude Desktop) to interact with the 3D scene in real-time.

#### Automated Startup (Recommended)

**Unix/Linux/Mac:**
```bash
./start.sh
```

**Windows:**
```cmd
start.bat
```

The startup script will:
1. ✓ Check and install all dependencies
2. ✓ Build the MCP server
3. ✓ Start the WebSocket relay server (port 3001)
4. ✓ Start the MCP server (stdio)
5. ✓ Start the React development server (port 5173)

**After running the script:**
- Open http://localhost:5173 in your browser
- Start Claude Desktop manually
- Claude Desktop will automatically connect to the MCP server

Logs are available in the `logs/` directory.

#### Manual Startup

If you prefer to start servers individually:

```bash
# Terminal 1: Start Relay Server
cd mcp-server
node relay.js

# Terminal 2: Start MCP Server
cd mcp-server
npm start

# Terminal 3: Start React App
npm run dev
```

#### Using the MCP Server

Once all servers are running, Claude Desktop can control the 3D scene using MCP tools. See **[KNOWLEDGEBASE.md](KNOWLEDGEBASE.md)** for:
- Complete MCP tools reference
- Scene building workflows
- Examples and best practices
- Troubleshooting guide

**Quick Example:**
```typescript
// Create a glass card in the scene
use_mcp_tool({
  server_name: "three-split-mcp-server",
  tool_name: "create_object",
  arguments: {
    type: "GlassCard",
    position: [0, 1.2, 0],
    properties: {
      title: "Hello World",
      subtitle: "Created via MCP"
    }
  }
})
```

## Documentation

Comprehensive documentation is available:

### MCP Server Documentation
- **[KNOWLEDGEBASE.md](KNOWLEDGEBASE.md)** - Complete MCP tools reference for Claude Desktop

### Design & Architecture Documentation
- **[Creative Direction](docs/CREATIVE_DIRECTION.md)** - Vision, tone, brand guidelines
- **[Information Architecture](docs/INFORMATION_ARCHITECTURE.md)** - Site structure, navigation flows
- **[Component Library](docs/COMPONENT_LIBRARY.md)** - 3D UI component specifications
- **[Shader Specification](docs/SHADER_SPECIFICATION.md)** - Liquid Glass rendering system
- **[Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md)** - System design & data flow
- **[Asset Pipeline](docs/ASSET_PIPELINE.md)** - Blender modeling & export guidelines
- **[Animation System](docs/ANIMATION_SYSTEM.md)** - Motion design rules & timings
- **[Accessibility](docs/ACCESSIBILITY.md)** - A11y requirements & fallbacks
- **[Performance](docs/PERFORMANCE.md)** - Optimization strategies
- **[Implementation Plan](docs/IMPLEMENTATION_PLAN.md)** - Phased development roadmap
- **[Mock Data](docs/MOCK_DATA.md)** - Portfolio content & sample data
- **[MVP Layout](docs/MVP_LAYOUT.md)** - 3D scene graph & spatial blueprint

## Implementation Phases

| Phase | Duration | Focus |
|-------|----------|-------|
| 0 - Discovery | Week 0 | Documentation, planning, tech decisions |
| 1 - Prototype | Weeks 1-3 | Single scene, basic glass material |
| 2 - Components | Weeks 3-6 | UI component library |
| 3 - Scenes | Weeks 6-8 | All portfolio rooms |
| 4 - Polish | Weeks 8-10 | Motion, accessibility, fallbacks |
| 5 - Optimization | Weeks 10-11 | Performance tuning |
| 6 - Launch | Week 12 | Final QA & deployment |

## Key Features

### Liquid Glass Material System
- Real-time screen-space refraction
- Depth-aware distortion
- Gaussian blur backplate
- Fresnel rim highlights
- Subtle chromatic dispersion
- Dynamic normal perturbation

### 3D Navigation
- Spline-based camera paths between nodes
- Smooth easeInOutCubic transitions
- Deep-linking support for all views
- Parallax background effects

### Interaction Model
- Hover: Scale + Fresnel boost + ripple effects
- Click: Tactile press animation + panel expansion
- Idle: Subtle floating oscillation

### Accessibility
- Reduced motion mode
- Reduced transparency fallback
- High contrast mode
- Keyboard navigation
- Screen reader support via HTML layer

## Browser Support

| Browser | Support Level |
|---------|---------------|
| Chrome (latest) | Full |
| Safari (latest) | Full |
| Edge (Chromium) | Full |
| Firefox | WebGL fallback |
| Mobile Safari/Chrome | Optimized fallback |

## Performance Targets

- **Desktop**: 60 FPS on mid-range GPU
- **Mobile**: 30 FPS with simplified materials
- **Max triangles in view**: 250,000
- **Max active glass panels**: 6

## Contributing

See documentation for component specifications and coding standards before contributing.

## License

Proprietary - Enkayel Studios

---

*Built with the Liquid Glass design system, inspired by Apple's revolutionary approach to digital materials.*
