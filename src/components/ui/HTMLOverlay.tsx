import { useNavigationStore, useAccessibilityStore } from '@/store'
import type { NodeId } from '@/store'

const nodeLabels: Record<NodeId, string> = {
  home: 'Home',
  consulting: 'Consulting',
  software: 'Software',
  construction: 'Construction',
  contact: 'Contact',
}

export default function HTMLOverlay() {
  const { currentNode, navigateTo, isTransitioning } = useNavigationStore()
  const { reducedMotion, setReducedMotion, reducedTransparency, setReducedTransparency } =
    useAccessibilityStore()

  return (
    <>
      {/* Navigation toolbar */}
      <nav
        style={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '2rem',
          border: '1px solid rgba(255,255,255,0.1)',
          zIndex: 50,
        }}
        aria-label="Main navigation"
      >
        {(Object.keys(nodeLabels) as NodeId[]).map((node) => (
          <button
            key={node}
            onClick={() => navigateTo(node)}
            disabled={isTransitioning || currentNode === node}
            style={{
              padding: '0.5rem 1rem',
              background:
                currentNode === node ? 'rgba(255,255,255,0.15)' : 'transparent',
              border: 'none',
              borderRadius: '1.5rem',
              color: currentNode === node ? '#ffffff' : 'rgba(255,255,255,0.7)',
              cursor: isTransitioning ? 'wait' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: currentNode === node ? 600 : 400,
              transition: 'all 0.2s ease',
            }}
            aria-current={currentNode === node ? 'page' : undefined}
          >
            {nodeLabels[node]}
          </button>
        ))}
      </nav>

      {/* Accessibility controls */}
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          padding: '0.75rem',
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '0.75rem',
          border: '1px solid rgba(255,255,255,0.1)',
          zIndex: 50,
          fontSize: '0.75rem',
        }}
        role="region"
        aria-label="Accessibility settings"
      >
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'rgba(255,255,255,0.8)',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={reducedMotion}
            onChange={(e) => setReducedMotion(e.target.checked)}
            style={{ accentColor: '#4A90D9' }}
          />
          Reduce motion
        </label>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'rgba(255,255,255,0.8)',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={reducedTransparency}
            onChange={(e) => setReducedTransparency(e.target.checked)}
            style={{ accentColor: '#4A90D9' }}
          />
          Reduce transparency
        </label>
      </div>

      {/* Current node indicator (for debugging) */}
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          padding: '0.5rem 1rem',
          background: 'rgba(0,0,0,0.5)',
          borderRadius: '0.5rem',
          color: 'rgba(255,255,255,0.5)',
          fontSize: '0.75rem',
          zIndex: 50,
        }}
      >
        Current: {currentNode}
        {isTransitioning && ' (transitioning...)'}
      </div>

      {/* Hero content overlay for Home */}
      {currentNode === 'home' && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -80%)',
            textAlign: 'center',
            color: '#ffffff',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 600,
              marginBottom: '0.5rem',
              textShadow: '0 2px 20px rgba(0,0,0,0.5)',
            }}
          >
            Enkayel Studios
          </h1>
          <p
            style={{
              fontSize: '1rem',
              opacity: 0.8,
              textShadow: '0 1px 10px rgba(0,0,0,0.5)',
            }}
          >
            Crafting Systems, Spaces & Software
          </p>
        </div>
      )}
    </>
  )
}
