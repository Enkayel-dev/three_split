# Technical Architecture

## Overview

This document defines the complete system architecture for the Liquid Glass 3D portfolio website. It covers module responsibilities, data flow, rendering pipeline integration, and infrastructure decisions.

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION LAYER (React)                             │
│                                                                                 │
│  ┌──────────────────┐   ┌─────────────────────┐   ┌─────────────────────────┐  │
│  │   App Shell      │──▶│   Router            │──▶│   Scene Manager         │  │
│  │   (Layout)       │   │   (react-router)    │   │   (Node Graph)          │  │
│  └──────────────────┘   └─────────────────────┘   └─────────────────────────┘  │
│           │                       │                           │                 │
│           ▼                       ▼                           ▼                 │
│  ┌──────────────────┐   ┌─────────────────────┐   ┌─────────────────────────┐  │
│  │   State Store    │◀──│   Camera Controller │◀──│   Interaction System    │  │
│  │   (Zustand)      │   │   (Splines/Lerp)    │   │   (Pointer Events)      │  │
│  └──────────────────┘   └─────────────────────┘   └─────────────────────────┘  │
│           │                       │                           │                 │
│           ▼                       ▼                           ▼                 │
│  ┌──────────────────┐   ┌─────────────────────┐   ┌─────────────────────────┐  │
│  │   Animation      │   │   Component         │   │   Accessibility         │  │
│  │   (react-spring) │   │   Library (3D)      │   │   Adapter               │  │
│  └──────────────────┘   └─────────────────────┘   └─────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       RENDERING LAYER (Three.js / R3F)                          │
│                                                                                 │
│  ┌──────────────────┐   ┌─────────────────────┐   ┌─────────────────────────┐  │
│  │   Renderer       │──▶│   Render Targets    │──▶│   PostProcess Pipeline  │  │
│  │   (WebGL2)       │   │   (FBOs)            │   │   (Custom Passes)       │  │
│  └──────────────────┘   └─────────────────────┘   └─────────────────────────┘  │
│           │                       │                           │                 │
│           ▼                       ▼                           ▼                 │
│  ┌──────────────────┐   ┌─────────────────────┐   ┌─────────────────────────┐  │
│  │   Material       │   │   Blur Pass         │   │   Glass Refraction      │  │
│  │   Library        │   │   (Gaussian)        │   │   Pass                  │  │
│  └──────────────────┘   └─────────────────────┘   └─────────────────────────┘  │
│           │                                                   │                 │
│           ▼                                                   ▼                 │
│  ┌──────────────────┐                             ┌─────────────────────────┐  │
│  │   Lighting /     │                             │   Specular / Fresnel    │  │
│  │   Environment    │                             │   Highlight Pass        │  │
│  └──────────────────┘                             └─────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           ASSET LAYER                                           │
│                                                                                 │
│  ┌──────────────────┐   ┌─────────────────────┐   ┌─────────────────────────┐  │
│  │   Asset Loader   │   │   GLTF Models       │   │   Textures / HDRI       │  │
│  │   (DRACO)        │   │   (from Blender)    │   │                         │  │
│  └──────────────────┘   └─────────────────────┘   └─────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Module Specifications

### 1. App Shell

**Responsibility**: Root application layout, provider setup, global context

**Dependencies**: React, React Router, Zustand

```typescript
// src/App.tsx
function App() {
  return (
    <StoreProvider>
      <AccessibilityProvider>
        <RouterProvider>
          <Canvas>
            <SceneManager />
          </Canvas>
          <HTMLOverlay />
        </RouterProvider>
      </AccessibilityProvider>
    </StoreProvider>
  );
}
```

**Exports**:
- Root component
- Global providers

---

### 2. Router / Navigation

**Responsibility**: URL-based navigation, deep linking, history management

**Dependencies**: react-router-dom (or TanStack Router)

**Route Configuration**:

```typescript
const routes = [
  { path: '/', element: <HomeHub /> },
  { path: '/consulting', element: <ConsultingRoom /> },
  { path: '/consulting/:id', element: <ProjectDetail /> },
  { path: '/software', element: <SoftwareRoom /> },
  { path: '/software/:id', element: <ProjectDetail /> },
  { path: '/construction', element: <ConstructionRoom /> },
  { path: '/construction/:id', element: <ProjectDetail /> },
  { path: '/contact', element: <ContactNode /> },
];
```

**URL ↔ Camera Sync**:
- Route changes trigger camera transitions
- Camera position maps to specific route
- Browser history integrates with 3D navigation

---

### 3. State Store (Zustand)

**Responsibility**: Global application state, UI state, preferences

**Store Structure**:

```typescript
interface AppState {
  // Navigation
  currentNode: NodeId;
  previousNode: NodeId | null;
  isTransitioning: boolean;

  // UI State
  activeModal: ModalId | null;
  hoveredElement: ElementId | null;
  selectedProject: ProjectId | null;

  // Accessibility
  reducedMotion: boolean;
  reducedTransparency: boolean;
  highContrast: boolean;

  // Performance
  qualityLevel: 'high' | 'medium' | 'low' | 'fallback';

  // Actions
  navigateTo: (node: NodeId) => void;
  openModal: (modal: ModalId) => void;
  closeModal: () => void;
  setAccessibility: (prefs: Partial<AccessibilityPrefs>) => void;
}
```

---

### 4. Scene Manager

**Responsibility**: Load and manage 3D scenes, node graph, visibility

**Core Functions**:
- Load/unload scene assets based on current node
- Manage scene graph hierarchy
- Handle transitions between nodes
- Prefetch adjacent nodes

```typescript
interface SceneManager {
  nodes: Map<NodeId, SceneNode>;
  currentNode: NodeId;

  loadNode(nodeId: NodeId): Promise<void>;
  unloadNode(nodeId: NodeId): void;
  transitionTo(nodeId: NodeId, duration: number): void;
  getNodePosition(nodeId: NodeId): Vector3;
}
```

---

### 5. Camera Controller

**Responsibility**: Camera positioning, spline-based transitions, parallax

**Features**:
- Predefined camera positions per node
- Bezier spline interpolation between positions
- Smooth easing (easeInOutCubic)
- Parallax offset based on pointer position
- Device orientation parallax (mobile)

```typescript
interface CameraController {
  position: Vector3;
  target: Vector3;

  moveTo(position: Vector3, target: Vector3, duration: number): void;
  followSpline(spline: CubicBezierCurve3, duration: number): void;
  applyParallax(offset: Vector2): void;
}
```

**Spline Transition Example**:

```typescript
const splines = {
  'home-to-consulting': new CubicBezierCurve3(
    new Vector3(-3, 1.5, 3),    // Start (Home)
    new Vector3(-1, 2.0, 2),    // Control 1
    new Vector3(-0.5, 1.8, 1),  // Control 2
    new Vector3(0, 1.5, 3)      // End (Consulting)
  ),
};
```

---

### 6. Interaction System

**Responsibility**: Pointer events, raycasting, UI event dispatch

**Event Flow**:

```
Pointer Event (DOM)
        │
        ▼
    Raycaster
        │
        ▼
  Hit Detection
        │
        ▼
  Event Dispatch
   ┌────┴────┐
   ▼         ▼
Hover     Click
Events    Events
```

**Implementation**:

```typescript
interface InteractionSystem {
  raycaster: Raycaster;
  hoveredObject: Object3D | null;

  onPointerMove(event: PointerEvent): void;
  onPointerDown(event: PointerEvent): void;
  onPointerUp(event: PointerEvent): void;

  registerInteractable(object: Object3D, handlers: EventHandlers): void;
  unregisterInteractable(object: Object3D): void;
}
```

---

### 7. Animation System

**Responsibility**: Centralized animation values, springs, timelines

**Library**: react-spring (or framer-motion-3d)

**Animation Tokens**:

```typescript
const animationTokens = {
  timing: {
    fast: 120,      // ms
    medium: 280,    // ms
    slow: 600,      // ms
    pageTransit: 900,
  },
  spring: {
    gentle: { tension: 120, friction: 14 },
    snappy: { tension: 180, friction: 12 },
    wobbly: { tension: 180, friction: 20, mass: 2 },
  },
  easing: {
    smooth: 'cubic-bezier(0.2, 0.85, 0.25, 1)',
  },
};
```

---

### 8. Component Library (3D)

**Responsibility**: Reusable 3D UI components with consistent API

**Components**:
- `<GlassPanel />`
- `<GlassCard />`
- `<GlassButton />`
- `<GlassToolbar />`
- `<GlassModal />`
- `<IconPlate />`
- `<FormInput />`

See [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md) for detailed specifications.

---

### 9. Material Library

**Responsibility**: Centralized material definitions, LOD variants

**Structure**:

```typescript
const materials = {
  liquidGlass: {
    high: createLiquidGlassMaterial({ lod: 'high' }),
    medium: createLiquidGlassMaterial({ lod: 'medium' }),
    low: createLiquidGlassMaterial({ lod: 'low' }),
    fallback: createFallbackMaterial(),
  },
};
```

---

### 10. PostProcess Pipeline

**Responsibility**: Multi-pass rendering, blur, refraction, effects

**Pass Order**:
1. Opaque geometry
2. Depth buffer
3. Normal buffer (glass)
4. Blur pass
5. Glass refraction pass
6. Composite
7. Post effects (optional)

See [SHADER_SPECIFICATION.md](./SHADER_SPECIFICATION.md) for implementation details.

---

### 11. Asset Loader

**Responsibility**: GLTF loading, texture management, caching

**Features**:
- DRACO compression support
- Progressive loading
- Texture compression (KTX2/Basis)
- Preloading for adjacent scenes

```typescript
interface AssetLoader {
  loadModel(path: string): Promise<GLTF>;
  loadTexture(path: string): Promise<Texture>;
  loadHDRI(path: string): Promise<Texture>;

  preload(paths: string[]): Promise<void>;
  dispose(paths: string[]): void;
}
```

---

### 12. Performance Monitor

**Responsibility**: FPS tracking, shader cost estimation, LOD switching

**Metrics Tracked**:
- Frame time (ms)
- GPU memory usage
- Draw calls
- Triangles rendered

**Auto-LOD Logic**:

```typescript
function updateQualityLevel(fps: number) {
  if (fps < 30) return 'low';
  if (fps < 45) return 'medium';
  if (fps < 55) return 'high';
  return 'high';
}
```

---

### 13. Accessibility Adapter

**Responsibility**: Map OS preferences to runtime flags, provide fallbacks

**Detected Preferences**:
- `prefers-reduced-motion`
- `prefers-reduced-transparency`
- `prefers-contrast`
- `prefers-color-scheme`

**Implementation**:

```typescript
function useAccessibilityPreferences() {
  const [prefs, setPrefs] = useState({
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    reducedTransparency: false, // OS-specific detection
    highContrast: window.matchMedia('(prefers-contrast: more)').matches,
  });

  // Listen for changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => setPrefs(p => ({ ...p, reducedMotion: e.matches }));
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return prefs;
}
```

---

## Data Flow

### Navigation Flow

```
User Click → Router Update → Scene Manager → Camera Controller → Render
     │            │               │                │
     │            ▼               ▼                ▼
     │       URL Change    Load Assets      Spline Transition
     │            │               │                │
     └────────────┴───────────────┴────────────────┘
                           │
                    Store Update
```

### Interaction Flow

```
Pointer Event → Raycaster → Hit Test → Component Handler → State Update → Re-render
```

### Render Flow

```
Scene Graph → Render Targets → Post Processing → Composite → Display
     │              │                │               │
     │              ▼                ▼               ▼
     │        Color Buffer      Blur Pass      Final Frame
     │        Depth Buffer      Refraction
     │        Normal Buffer
```

---

## File Structure

```
src/
├── app/
│   ├── App.tsx                 # Root component
│   ├── routes.ts               # Route configuration
│   └── providers/              # Context providers
│
├── components/
│   ├── glass/                  # 3D glass components
│   │   ├── GlassPanel.tsx
│   │   ├── GlassCard.tsx
│   │   ├── GlassButton.tsx
│   │   └── index.ts
│   ├── scenes/                 # Scene node components
│   │   ├── HomeHub.tsx
│   │   ├── ConsultingRoom.tsx
│   │   ├── SoftwareRoom.tsx
│   │   ├── ConstructionRoom.tsx
│   │   └── ContactNode.tsx
│   └── ui/                     # HTML overlay components
│       ├── Toolbar.tsx
│       ├── Modal.tsx
│       └── AccessibilityPanel.tsx
│
├── systems/
│   ├── camera/                 # Camera controller
│   │   ├── CameraController.ts
│   │   ├── splines.ts
│   │   └── parallax.ts
│   ├── interaction/            # Interaction system
│   │   ├── InteractionManager.ts
│   │   └── Raycaster.ts
│   ├── animation/              # Animation utilities
│   │   ├── tokens.ts
│   │   └── springs.ts
│   └── rendering/              # Render pipeline
│       ├── PostProcessing.ts
│       ├── BlurPass.ts
│       └── RefractionPass.ts
│
├── materials/
│   ├── LiquidGlassMaterial.ts  # Custom shader material
│   ├── shaders/
│   │   ├── glass.vert
│   │   └── glass.frag
│   └── index.ts
│
├── store/
│   ├── index.ts                # Zustand store
│   ├── slices/
│   │   ├── navigation.ts
│   │   ├── ui.ts
│   │   └── accessibility.ts
│   └── selectors.ts
│
├── hooks/
│   ├── useCamera.ts
│   ├── useInteraction.ts
│   ├── useAccessibility.ts
│   └── usePerformance.ts
│
├── assets/
│   ├── models/                 # GLTF files
│   ├── textures/               # Texture files
│   └── hdri/                   # Environment maps
│
├── data/
│   ├── portfolio.json          # Portfolio content
│   └── nodes.json              # Scene node definitions
│
└── utils/
    ├── math.ts
    ├── constants.ts
    └── helpers.ts
```

---

## Build & Deployment

### Build Tool: Vite

**Configuration**:

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    glsl(), // GLSL shader imports
  ],
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          fiber: ['@react-three/fiber', '@react-three/drei'],
        },
      },
    },
  },
});
```

### Deployment Targets

| Platform | Configuration |
|----------|---------------|
| Vercel | Zero-config, edge functions |
| Netlify | Static export + functions |
| AWS S3 + CloudFront | CDN distribution |

### Performance Budget

| Metric | Target |
|--------|--------|
| Initial JS | < 250KB gzipped |
| Initial CSS | < 50KB gzipped |
| 3D Assets | < 2MB total |
| Time to Interactive | < 3s (3G) |
| Lighthouse Performance | > 90 |

---

## Integration Points

### URL ↔ Camera State

```typescript
// Sync URL to camera on route change
useEffect(() => {
  const node = getNodeFromPath(location.pathname);
  cameraController.transitionTo(node.cameraPosition, 900);
}, [location.pathname]);
```

### HTML Overlays

For SEO and accessibility, critical text content exists in HTML:

```tsx
<Html
  position={[0, 1.2, 0.01]}
  transform
  occlude
  style={{ pointerEvents: 'none' }}
>
  <h1 className="sr-only">Enkayel Studios Portfolio</h1>
</Html>
```

### External Integrations

| Service | Purpose |
|---------|---------|
| Calendly | Contact scheduling |
| Resend | Email notifications |
| Analytics | User tracking |
| Sentry | Error monitoring |

---

## Security Considerations

- No sensitive data in client-side state
- Environment variables for API keys
- CSP headers for WebGL content
- Rate limiting on contact form
- Input sanitization

---

## Testing Strategy

| Level | Tools | Coverage |
|-------|-------|----------|
| Unit | Vitest | Utilities, hooks |
| Component | React Testing Library | UI components |
| Visual | Storybook + Chromatic | Component states |
| E2E | Playwright | User flows |
| Performance | Lighthouse CI | Budget enforcement |

---

*This architecture document defines the technical foundation of the Liquid Glass website. All implementation should follow these patterns and structures.*
