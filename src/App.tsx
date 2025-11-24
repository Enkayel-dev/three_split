import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import Scene from './components/scenes/Scene'
import { useAccessibilityStore } from './store'
import LoadingScreen from './components/ui/LoadingScreen'
import HTMLOverlay from './components/ui/HTMLOverlay'
import { SceneBridge } from './mcp'

function App() {
  const { reducedMotion, reducedTransparency } = useAccessibilityStore()

  return (
    <>
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Main 3D Canvas */}
      <Canvas
        camera={{
          position: [-3, 1.5, 3],
          fov: 50,
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Scene
            reducedMotion={reducedMotion}
            reducedTransparency={reducedTransparency}
          />
          <Preload all />
        </Suspense>
      </Canvas>

      {/* Loading screen */}
      <Suspense fallback={<LoadingScreen />}>
        <HTMLOverlay />
      </Suspense>

      {/* Accessible content for screen readers */}
      <main id="main-content" className="sr-only">
        <h1>Enkayel Studios</h1>
        <p>
          Crafting Systems, Spaces, and Software That Work as One.
          Multi-disciplinary consultancy for businesses that think holistically.
        </p>
      </main>

      {/* MCP Scene Bridge - connects to Claude Desktop */}
      <SceneBridge />
    </>
  )
}

export default App
