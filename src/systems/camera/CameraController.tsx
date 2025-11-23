import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore } from '@/store'
import type { NodeId } from '@/store'

// Camera positions for each node
const cameraPositions: Record<NodeId, { position: THREE.Vector3; lookAt: THREE.Vector3 }> = {
  home: {
    position: new THREE.Vector3(0, 1.5, 4),
    lookAt: new THREE.Vector3(0, 1.2, 0),
  },
  consulting: {
    position: new THREE.Vector3(0, 1.5, 3),
    lookAt: new THREE.Vector3(0, 1.2, 0),
  },
  software: {
    position: new THREE.Vector3(0, 1.8, 3.5),
    lookAt: new THREE.Vector3(0, 1.5, 0),
  },
  construction: {
    position: new THREE.Vector3(0, 1.6, 3.2),
    lookAt: new THREE.Vector3(0, 1.5, 0),
  },
  contact: {
    position: new THREE.Vector3(0, 1.4, 2.8),
    lookAt: new THREE.Vector3(0, 1.2, 0),
  },
}

// Easing function
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

interface CameraControllerProps {
  reducedMotion: boolean
}

export default function CameraController({ reducedMotion }: CameraControllerProps) {
  const { camera } = useThree()

  // Animation state
  const transitionProgress = useRef(0)
  const transitionDuration = reducedMotion ? 0.1 : 0.8 // seconds
  const startPosition = useRef(new THREE.Vector3())
  const startLookAt = useRef(new THREE.Vector3())
  const targetPosition = useRef(new THREE.Vector3())
  const targetLookAt = useRef(new THREE.Vector3())
  const currentLookAt = useRef(new THREE.Vector3(0, 1.2, 0))
  const isAnimating = useRef(false)
  const lastNode = useRef<NodeId>('home')

  // Initialize camera position
  useEffect(() => {
    const initial = cameraPositions.home
    camera.position.copy(initial.position)
    currentLookAt.current.copy(initial.lookAt)
    camera.lookAt(initial.lookAt)
  }, [camera])

  // Animate camera transition using refs to access latest store state
  useFrame((_, delta) => {
    // Get current state directly from store to avoid stale closures
    const { currentNode, isTransitioning, setTransitioning } = useAppStore.getState()

    // Detect node change and start animation
    if (currentNode !== lastNode.current) {
      lastNode.current = currentNode
      const target = cameraPositions[currentNode]

      startPosition.current.copy(camera.position)
      startLookAt.current.copy(currentLookAt.current)
      targetPosition.current.copy(target.position)
      targetLookAt.current.copy(target.lookAt)
      transitionProgress.current = 0
      isAnimating.current = true
    }

    // Run animation
    if (isAnimating.current) {
      transitionProgress.current += delta / transitionDuration

      if (transitionProgress.current >= 1) {
        transitionProgress.current = 1
        isAnimating.current = false
        if (isTransitioning) {
          setTransitioning(false)
        }
      }

      const t = easeInOutCubic(Math.min(transitionProgress.current, 1))

      // Interpolate position
      camera.position.lerpVectors(startPosition.current, targetPosition.current, t)

      // Interpolate lookAt
      currentLookAt.current.lerpVectors(startLookAt.current, targetLookAt.current, t)
      camera.lookAt(currentLookAt.current)
    }
  })

  // Subtle parallax effect based on mouse movement
  useEffect(() => {
    if (reducedMotion) return

    const handleMouseMove = (event: MouseEvent) => {
      if (isAnimating.current) return

      const { currentNode } = useAppStore.getState()
      const x = (event.clientX / window.innerWidth - 0.5) * 0.15
      const y = (event.clientY / window.innerHeight - 0.5) * 0.1

      const target = cameraPositions[currentNode]
      camera.position.x = target.position.x + x
      camera.position.y = target.position.y - y
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [camera, reducedMotion])

  return null
}
