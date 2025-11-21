# Performance Budgeting & Optimization Plan

## Overview

This document defines performance targets, optimization strategies, and monitoring approaches for the Liquid Glass 3D website. Performance is critical—a beautiful site that stutters or lags undermines the premium feel.

---

## Performance Targets

### Frame Rate

| Device Class | Target FPS | Minimum FPS |
|--------------|------------|-------------|
| Desktop (dedicated GPU) | 60 | 50 |
| Desktop (integrated GPU) | 60 | 45 |
| Laptop | 60 | 40 |
| Tablet | 30-60 | 30 |
| Mobile (high-end) | 30 | 24 |
| Mobile (mid-range) | 30 | 20 |

### Load Time

| Metric | Target | Maximum |
|--------|--------|---------|
| First Contentful Paint | < 1.5s | 2.5s |
| Largest Contentful Paint | < 2.5s | 4s |
| Time to Interactive | < 3s | 5s |
| Total Blocking Time | < 200ms | 600ms |
| Cumulative Layout Shift | < 0.1 | 0.25 |

### Bundle Size

| Asset Type | Target | Maximum |
|------------|--------|---------|
| JavaScript (gzipped) | < 150KB | 250KB |
| CSS (gzipped) | < 30KB | 50KB |
| 3D Models (total) | < 1MB | 2MB |
| Textures (total) | < 500KB | 1MB |
| HDRI Environment | < 200KB | 500KB |
| Initial payload | < 500KB | 1MB |

---

## Rendering Budget

### Per-Frame Limits

| Metric | Budget |
|--------|--------|
| Draw calls | < 100 |
| Triangles rendered | < 250,000 |
| Shader switches | < 20 |
| Texture binds | < 30 |
| Frame time | < 16.67ms (60fps) |

### Glass Effect Costs

| Effect | Approximate Cost |
|--------|------------------|
| Screen-space refraction | 2-4ms |
| Blur pass (half-res) | 1-2ms |
| Fresnel calculation | 0.1ms per object |
| Normal perturbation | 0.2ms per object |
| Full glass composite | 3-6ms total |

---

## Quality Levels (LOD)

### High Quality (Desktop)

```typescript
const highQuality = {
  resolution: 1.0, // Native
  blurResolution: 0.5, // Half-res blur
  maxGlassObjects: 10,
  refractionEnabled: true,
  dispersionEnabled: true,
  normalPerturbation: true,
  idleAnimations: true,
  parallax: true,
  postProcessing: ['blur', 'refraction', 'bloom'],
  shadowMapSize: 2048,
};
```

### Medium Quality (Laptop/Tablet)

```typescript
const mediumQuality = {
  resolution: 1.0,
  blurResolution: 0.33, // Third-res blur
  maxGlassObjects: 6,
  refractionEnabled: true,
  dispersionEnabled: false,
  normalPerturbation: false,
  idleAnimations: true,
  parallax: true,
  postProcessing: ['blur', 'refraction'],
  shadowMapSize: 1024,
};
```

### Low Quality (Mobile High-End)

```typescript
const lowQuality = {
  resolution: 0.75, // 75% resolution
  blurResolution: 0.25, // Quarter-res blur
  maxGlassObjects: 4,
  refractionEnabled: true,
  dispersionEnabled: false,
  normalPerturbation: false,
  idleAnimations: false,
  parallax: false,
  postProcessing: ['blur'],
  shadowMapSize: 512,
};
```

### Fallback (Mobile Low-End)

```typescript
const fallbackQuality = {
  resolution: 0.5, // Half resolution
  blurResolution: 0, // No blur pass
  maxGlassObjects: 2,
  refractionEnabled: false,
  dispersionEnabled: false,
  normalPerturbation: false,
  idleAnimations: false,
  parallax: false,
  postProcessing: [],
  shadowMapSize: 0, // No shadows
  useFallbackMaterial: true, // Simple transparent
};
```

---

## Automatic Quality Adjustment

### FPS-Based Scaling

```typescript
class PerformanceManager {
  private frameHistory: number[] = [];
  private currentQuality: QualityLevel = 'high';

  update(deltaTime: number) {
    const fps = 1000 / deltaTime;
    this.frameHistory.push(fps);

    if (this.frameHistory.length > 60) {
      this.frameHistory.shift();
    }

    const avgFps = this.frameHistory.reduce((a, b) => a + b) / this.frameHistory.length;

    // Adjust quality based on average FPS
    if (avgFps < 25 && this.currentQuality !== 'fallback') {
      this.decreaseQuality();
    } else if (avgFps < 40 && this.currentQuality === 'high') {
      this.decreaseQuality();
    } else if (avgFps > 55 && this.currentQuality !== 'high') {
      this.increaseQuality();
    }
  }

  private decreaseQuality() {
    const levels: QualityLevel[] = ['high', 'medium', 'low', 'fallback'];
    const currentIndex = levels.indexOf(this.currentQuality);
    if (currentIndex < levels.length - 1) {
      this.currentQuality = levels[currentIndex + 1];
      this.applyQuality();
    }
  }

  private increaseQuality() {
    const levels: QualityLevel[] = ['high', 'medium', 'low', 'fallback'];
    const currentIndex = levels.indexOf(this.currentQuality);
    if (currentIndex > 0) {
      this.currentQuality = levels[currentIndex - 1];
      this.applyQuality();
    }
  }
}
```

---

## Optimization Strategies

### 1. Render Target Optimization

```typescript
// Use appropriate precision
const colorTarget = new THREE.WebGLRenderTarget(width, height, {
  type: THREE.HalfFloatType, // Not full float
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  generateMipmaps: false, // Disable if not needed
});

// Blur at reduced resolution
const blurWidth = Math.floor(width * 0.5);
const blurHeight = Math.floor(height * 0.5);
```

### 2. Frustum Culling

```typescript
// Enable frustum culling (default in Three.js)
mesh.frustumCulled = true;

// For custom bounds
mesh.geometry.computeBoundingSphere();
```

### 3. Object Pooling

```typescript
class CardPool {
  private pool: GlassCard[] = [];
  private active: Set<GlassCard> = new Set();

  acquire(): GlassCard {
    const card = this.pool.pop() || this.createCard();
    this.active.add(card);
    return card;
  }

  release(card: GlassCard) {
    this.active.delete(card);
    card.reset();
    this.pool.push(card);
  }
}
```

### 4. Texture Optimization

```typescript
// Use compressed textures
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';

const ktx2Loader = new KTX2Loader()
  .setTranscoderPath('/basis/')
  .detectSupport(renderer);

// Mipmap generation for distant objects
texture.generateMipmaps = true;
texture.minFilter = THREE.LinearMipmapLinearFilter;
```

### 5. Geometry Instancing

```typescript
// For repeated elements like particles
const instancedMesh = new THREE.InstancedMesh(
  geometry,
  material,
  count
);

// Set transforms per instance
const matrix = new THREE.Matrix4();
for (let i = 0; i < count; i++) {
  matrix.setPosition(x, y, z);
  instancedMesh.setMatrixAt(i, matrix);
}
instancedMesh.instanceMatrix.needsUpdate = true;
```

### 6. Lazy Loading

```typescript
// Load scenes on demand
async function loadScene(sceneId: string) {
  const { default: sceneData } = await import(`./scenes/${sceneId}.json`);
  const models = await Promise.all(
    sceneData.models.map((path: string) => loadModel(path))
  );
  return models;
}

// Preload adjacent scenes
function preloadAdjacentScenes(currentSceneId: string) {
  const adjacent = getAdjacentSceneIds(currentSceneId);
  adjacent.forEach(id => {
    // Start loading but don't block
    loadScene(id).catch(() => {}); // Ignore errors for preload
  });
}
```

### 7. Animation Optimization

```typescript
// Pause animations when not visible
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      pauseAllAnimations();
    } else {
      resumeAllAnimations();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);

// Throttle parallax updates
const throttledParallax = throttle((x, y) => {
  applyParallax(x, y);
}, 33); // ~30fps
```

### 8. Conditional Rendering

```typescript
// Only render effects when needed
useFrame((state, delta) => {
  const hasMoved = cameraHasMoved || objectsHaveMoved;

  if (hasMoved) {
    // Full render with effects
    renderWithEffects();
    lastRenderTime = Date.now();
  } else if (Date.now() - lastRenderTime < 100) {
    // Recent movement, keep updating briefly
    renderWithEffects();
  } else {
    // Static scene, skip heavy passes
    renderSimple();
  }
});
```

---

## Asset Optimization

### 3D Models

| Optimization | Tool | Target |
|--------------|------|--------|
| DRACO compression | gltf-pipeline | 60-80% size reduction |
| Mesh simplification | Blender Decimate | Based on LOD |
| Remove unused data | gltf-transform | Strip animations, etc. |

```bash
# DRACO compression
gltf-pipeline -i model.glb -o model-draco.glb --draco.compressionLevel 7

# Optimize with gltf-transform
gltf-transform optimize input.glb output.glb --compress draco
```

### Textures

| Format | Use Case | Compression |
|--------|----------|-------------|
| KTX2 (Basis) | All textures | GPU-native compression |
| WebP | Fallback | Lossy, good quality |
| AVIF | Modern browsers | Best compression |

```bash
# Convert to KTX2
toktx --genmipmap --bcmp --clevel 2 output.ktx2 input.png
```

### HDRI Environment

```bash
# Reduce HDRI resolution and convert
npx @pmndrs/assets 1024 1024 studio_small.hdr
```

---

## Code Splitting

### Route-Based Splitting

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          fiber: ['@react-three/fiber', '@react-three/drei'],
          spring: ['@react-spring/three'],
        },
      },
    },
  },
});
```

### Dynamic Imports

```typescript
// Lazy load heavy components
const ConsultingRoom = lazy(() => import('./scenes/ConsultingRoom'));
const SoftwareRoom = lazy(() => import('./scenes/SoftwareRoom'));

// In router
<Suspense fallback={<LoadingScreen />}>
  <Routes>
    <Route path="/consulting" element={<ConsultingRoom />} />
    <Route path="/software" element={<SoftwareRoom />} />
  </Routes>
</Suspense>
```

---

## Monitoring & Profiling

### Performance Metrics Collection

```typescript
function collectPerformanceMetrics() {
  return {
    fps: getCurrentFPS(),
    frameTime: getAverageFrameTime(),
    drawCalls: renderer.info.render.calls,
    triangles: renderer.info.render.triangles,
    geometries: renderer.info.memory.geometries,
    textures: renderer.info.memory.textures,
    programs: renderer.info.programs?.length || 0,
  };
}
```

### Development Overlay

```tsx
function PerformanceOverlay() {
  const [metrics, setMetrics] = useState({});

  useFrame(() => {
    if (process.env.NODE_ENV === 'development') {
      setMetrics(collectPerformanceMetrics());
    }
  });

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <Html position={[0, 0, 0]}>
      <div className="perf-overlay">
        <div>FPS: {metrics.fps?.toFixed(0)}</div>
        <div>Draw Calls: {metrics.drawCalls}</div>
        <div>Triangles: {metrics.triangles?.toLocaleString()}</div>
      </div>
    </Html>
  );
}
```

### Browser DevTools

Use these tools:
- **Chrome DevTools Performance tab**: CPU/GPU profiling
- **Three.js Inspector extension**: Scene debugging
- **Spector.js**: WebGL call inspection
- **stats.js**: FPS/memory monitoring

---

## Testing Performance

### Automated Tests

```typescript
// vitest performance test
describe('Performance', () => {
  it('renders initial frame under 100ms', async () => {
    const start = performance.now();
    await renderScene();
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100);
  });

  it('maintains 60fps with 6 glass objects', async () => {
    const scene = createSceneWith6GlassObjects();
    const fps = await measureFPS(scene, 1000);
    expect(fps).toBeGreaterThanOrEqual(55);
  });
});
```

### Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://preview-${{ github.sha }}.site.com/
          budgetPath: ./lighthouse-budget.json
```

### Budget File

```json
// lighthouse-budget.json
[
  {
    "resourceSizes": [
      { "resourceType": "script", "budget": 250 },
      { "resourceType": "stylesheet", "budget": 50 },
      { "resourceType": "image", "budget": 500 },
      { "resourceType": "total", "budget": 1000 }
    ],
    "resourceCounts": [
      { "resourceType": "third-party", "budget": 10 }
    ],
    "timings": [
      { "metric": "first-contentful-paint", "budget": 2000 },
      { "metric": "interactive", "budget": 3500 },
      { "metric": "largest-contentful-paint", "budget": 3000 }
    ]
  }
]
```

---

## Checklist

### Pre-Launch Performance Audit

- [ ] Lighthouse Performance score > 90
- [ ] All assets optimized (DRACO, KTX2)
- [ ] Code splitting implemented
- [ ] Lazy loading for non-critical scenes
- [ ] Quality auto-adjustment working
- [ ] 60 FPS on target desktop hardware
- [ ] 30 FPS on target mobile hardware
- [ ] Fallback mode tested and functional
- [ ] No memory leaks (test with extended use)
- [ ] Network requests minimized
- [ ] Caching headers configured

### Ongoing Monitoring

- [ ] Error tracking (Sentry)
- [ ] Performance analytics
- [ ] User device/browser distribution
- [ ] Real user monitoring (RUM)

---

*Performance optimization is an ongoing process. Monitor real-world metrics and adjust quality settings and optimizations based on actual user data.*
