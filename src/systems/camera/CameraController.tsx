import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useNavigationStore } from '@/store'
import type { NodeId } from '@/store'

// Camera positions for each node
const cameraPositions: Record<NodeId, { position: THREE.Vector3; lookAt: THREE.Vector3 }> = {
  home: {
    position: new THREE.Vector3(-3, 1.5, 3),
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
  const { currentNode, previousNode, isTransitioning, setTransitioning } = useNavigationStore()

  // Animation state
  const transitionProgress = useRef(0)
  const transitionDuration = reducedMotion ? 0.1 : 0.9 // seconds
  const startPosition = useRef(new THREE.Vector3())
  const startLookAt = useRef(new THREE.Vector3())
  const targetPosition = useRef(new THREE.Vector3())
  const targetLookAt = useRef(new THREE.Vector3())
  const currentLookAt = useRef(new THREE.Vector3(0, 1.2, 0))

  // Initialize camera position
  useEffect(() => {
    const initial = cameraPositions.home
    camera.position.copy(initial.position)
    currentLookAt.current.copy(initial.lookAt)
    camera.lookAt(initial.lookAt)
  }, [camera])

  // Start transition when node changes
  useEffect(() => {
    if (!isTransitioning) return

    const target = cameraPositions[currentNode]
    // Note: we use current camera position as start, not previousNode position
    // This allows smooth transitions from any position

    startPosition.current.copy(camera.position)
    startLookAt.current.copy(currentLookAt.current)
    targetPosition.current.copy(target.position)
    targetLookAt.current.copy(target.lookAt)
    transitionProgress.current = 0
  }, [currentNode, previousNode, isTransitioning, camera])

  // Animate camera transition
  useFrame((_, delta) => {
    if (!isTransitioning) return

    transitionProgress.current += delta / transitionDuration

    if (transitionProgress.current >= 1) {
      transitionProgress.current = 1
      setTransitioning(false)
    }

    const t = easeInOutCubic(Math.min(transitionProgress.current, 1))

    // Interpolate position
    camera.position.lerpVectors(startPosition.current, targetPosition.current, t)

    // Interpolate lookAt
    currentLookAt.current.lerpVectors(startLookAt.current, targetLookAt.current, t)
    camera.lookAt(currentLookAt.current)
  })

  // Subtle parallax effect based on mouse movement
  useEffect(() => {
    if (reducedMotion) return

    const handleMouseMove = (event: MouseEvent) => {
      if (isTransitioning) return

      const x = (event.clientX / window.innerWidth - 0.5) * 0.02
      const y = (event.clientY / window.innerHeight - 0.5) * 0.02

      const target = cameraPositions[currentNode]
      camera.position.x = target.position.x + x
      camera.position.y = target.position.y - y
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [camera, currentNode, isTransitioning, reducedMotion])

  return null
}
