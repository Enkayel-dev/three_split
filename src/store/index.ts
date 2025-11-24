import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import type { SceneObject } from '@/mcp/types'

// Node IDs for navigation
export type NodeId = 'home' | 'consulting' | 'software' | 'construction' | 'contact'

// Re-export SceneObject type
export type { SceneObject } from '@/mcp/types'

// Accessibility preferences
interface AccessibilityState {
  reducedMotion: boolean
  reducedTransparency: boolean
  highContrast: boolean
  setReducedMotion: (value: boolean) => void
  setReducedTransparency: (value: boolean) => void
  setHighContrast: (value: boolean) => void
}

// Navigation state
interface NavigationState {
  currentNode: NodeId
  previousNode: NodeId | null
  isTransitioning: boolean
  navigateTo: (node: NodeId) => void
  setTransitioning: (value: boolean) => void
}

// UI state
interface UIState {
  hoveredElement: string | null
  activeModal: string | null
  setHoveredElement: (id: string | null) => void
  openModal: (id: string) => void
  closeModal: () => void
}

// MCP Scene Objects state
interface SceneObjectsState {
  sceneObjects: SceneObject[]
  addSceneObject: (object: SceneObject) => void
  updateSceneObject: (id: string, updates: Partial<SceneObject>) => void
  removeSceneObject: (id: string) => void
  clearSceneObjects: () => void
}

// Combined app state
interface AppState extends AccessibilityState, NavigationState, UIState, SceneObjectsState {}

// Detect system preferences
const getSystemPreferences = () => {
  if (typeof window === 'undefined') {
    return { reducedMotion: false, highContrast: false }
  }
  return {
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    highContrast: window.matchMedia('(prefers-contrast: more)').matches,
  }
}

const systemPrefs = getSystemPreferences()

// Main store
export const useAppStore = create<AppState>()(
  subscribeWithSelector((set) => ({
    // Accessibility
    reducedMotion: systemPrefs.reducedMotion,
    reducedTransparency: false,
    highContrast: systemPrefs.highContrast,
    setReducedMotion: (value) => set({ reducedMotion: value }),
    setReducedTransparency: (value) => set({ reducedTransparency: value }),
    setHighContrast: (value) => set({ highContrast: value }),

    // Navigation
    currentNode: 'home' as NodeId,
    previousNode: null,
    isTransitioning: false,
    navigateTo: (node) =>
      set((state) => ({
        previousNode: state.currentNode,
        currentNode: node,
        isTransitioning: true,
      })),
    setTransitioning: (value) => set({ isTransitioning: value }),

    // UI
    hoveredElement: null,
    activeModal: null,
    setHoveredElement: (id) => set({ hoveredElement: id }),
    openModal: (id) => set({ activeModal: id }),
    closeModal: () => set({ activeModal: null }),

    // MCP Scene Objects
    sceneObjects: [],
    addSceneObject: (object) =>
      set((state) => ({
        sceneObjects: [...state.sceneObjects, object],
      })),
    updateSceneObject: (id, updates) =>
      set((state) => ({
        sceneObjects: state.sceneObjects.map((obj) =>
          obj.id === id ? { ...obj, ...updates } : obj
        ),
      })),
    removeSceneObject: (id) =>
      set((state) => ({
        sceneObjects: state.sceneObjects.filter((obj) => obj.id !== id),
      })),
    clearSceneObjects: () => set({ sceneObjects: [] }),
  }))
)

// Convenience hooks for specific slices - using useShallow to prevent infinite loops
export const useAccessibilityStore = () =>
  useAppStore(
    useShallow((state) => ({
      reducedMotion: state.reducedMotion,
      reducedTransparency: state.reducedTransparency,
      highContrast: state.highContrast,
      setReducedMotion: state.setReducedMotion,
      setReducedTransparency: state.setReducedTransparency,
      setHighContrast: state.setHighContrast,
    }))
  )

export const useNavigationStore = () =>
  useAppStore(
    useShallow((state) => ({
      currentNode: state.currentNode,
      previousNode: state.previousNode,
      isTransitioning: state.isTransitioning,
      navigateTo: state.navigateTo,
      setTransitioning: state.setTransitioning,
    }))
  )

export const useUIStore = () =>
  useAppStore(
    useShallow((state) => ({
      hoveredElement: state.hoveredElement,
      activeModal: state.activeModal,
      setHoveredElement: state.setHoveredElement,
      openModal: state.openModal,
      closeModal: state.closeModal,
    }))
  )

export const useSceneObjectsStore = () =>
  useAppStore(
    useShallow((state) => ({
      sceneObjects: state.sceneObjects,
      addSceneObject: state.addSceneObject,
      updateSceneObject: state.updateSceneObject,
      removeSceneObject: state.removeSceneObject,
      clearSceneObjects: state.clearSceneObjects,
    }))
  )
