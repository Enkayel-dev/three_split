import { useState, useMemo } from 'react'
import { ThreeEvent } from '@react-three/fiber'
import { RoundedBox, Text } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'

// ============================================================================
// GlassInput
// ============================================================================

interface GlassInputProps {
  label?: string
  placeholder?: string
  value?: string
  width?: number
  height?: number
  position?: [number, number, number]
  disabled?: boolean
  error?: boolean
  errorMessage?: string
  reducedTransparency?: boolean
  reducedMotion?: boolean
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
}

export function GlassInput({
  label,
  placeholder = '',
  value = '',
  width = 0.5,
  height = 0.06,
  position = [0, 0, 0],
  disabled = false,
  error = false,
  reducedTransparency = false,
  reducedMotion = false,
  onFocus,
  onBlur,
}: GlassInputProps) {
  const [focused, setFocused] = useState(false)
  const [hovered, setHovered] = useState(false)

  // Material
  const material = useMemo(() => {
    const baseColor = error ? '#ff6b6b' : '#ffffff'

    if (reducedTransparency) {
      return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0.1, 0.1, 0.12),
        transparent: true,
        opacity: 0.9,
        roughness: 0.5,
        metalness: 0,
        side: THREE.DoubleSide,
      })
    }

    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(baseColor),
      transparent: true,
      transmission: 0.75,
      roughness: 0.25,
      thickness: 0.008,
      ior: 1.4,
      metalness: 0,
      side: THREE.DoubleSide,
    })
  }, [error, reducedTransparency])

  // Animation
  const { borderOpacity, labelY } = useSpring({
    borderOpacity: focused ? 0.8 : hovered ? 0.4 : 0.2,
    labelY: focused || value ? 0.05 : 0,
    config: reducedMotion ? { duration: 0 } : { tension: 200, friction: 20 },
  })

  const handlePointerEnter = (e: ThreeEvent<PointerEvent>) => {
    if (disabled) return
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = 'text'
  }

  const handlePointerLeave = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(false)
    document.body.style.cursor = 'auto'
  }

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (disabled) return
    e.stopPropagation()
    setFocused(true)
    onFocus?.()
  }

  // Focus trap (simplified - actual input handled via HTML overlay)
  const handleBlur = () => {
    setFocused(false)
    onBlur?.()
  }

  const borderColor = error ? '#ff6b6b' : focused ? '#4A90D9' : '#ffffff'

  return (
    <group position={position}>
      {/* Label */}
      {label && (
        <animated.group position-y={labelY.to((y) => height / 2 + 0.02 + y)}>
          <Text
            position={[-width / 2 + 0.02, 0, 0.01]}
            fontSize={0.018}
            color={focused ? '#4A90D9' : '#888888'}
            anchorX="left"
            anchorY="middle"
          >
            {label}
          </Text>
        </animated.group>
      )}

      {/* Input field body */}
      <RoundedBox
        args={[width, height, 0.008]}
        radius={0.01}
        smoothness={4}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        onPointerMissed={handleBlur}
        material={material}
      />

      {/* Border highlight */}
      <animated.mesh position={[0, 0, 0.005]}>
        <planeGeometry args={[width - 0.01, height - 0.01]} />
        <animated.meshBasicMaterial
          color={borderColor}
          transparent
          opacity={borderOpacity}
          wireframe
          depthWrite={false}
        />
      </animated.mesh>

      {/* Value or placeholder text */}
      <Text
        position={[-width / 2 + 0.02, 0, 0.01]}
        fontSize={0.022}
        color={value ? '#ffffff' : '#666666'}
        anchorX="left"
        anchorY="middle"
        maxWidth={width - 0.04}
      >
        {value || placeholder}
      </Text>

      {/* Cursor (when focused) */}
      {focused && (
        <mesh position={[-width / 2 + 0.03 + value.length * 0.012, 0, 0.01]}>
          <planeGeometry args={[0.002, height * 0.6]} />
          <meshBasicMaterial color="#4A90D9" />
        </mesh>
      )}
    </group>
  )
}

// ============================================================================
// GlassTextarea
// ============================================================================

interface GlassTextareaProps {
  label?: string
  placeholder?: string
  value?: string
  width?: number
  height?: number
  position?: [number, number, number]
  disabled?: boolean
  error?: boolean
  reducedTransparency?: boolean
  reducedMotion?: boolean
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
}

export function GlassTextarea({
  label,
  placeholder = '',
  value = '',
  width = 0.5,
  height = 0.15,
  position = [0, 0, 0],
  disabled = false,
  error = false,
  reducedTransparency = false,
  reducedMotion = false,
  onFocus,
  onBlur,
}: GlassTextareaProps) {
  const [focused, setFocused] = useState(false)
  const [hovered, setHovered] = useState(false)

  const material = useMemo(() => {
    const baseColor = error ? '#ff6b6b' : '#ffffff'

    if (reducedTransparency) {
      return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0.1, 0.1, 0.12),
        transparent: true,
        opacity: 0.9,
        roughness: 0.5,
        metalness: 0,
        side: THREE.DoubleSide,
      })
    }

    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(baseColor),
      transparent: true,
      transmission: 0.75,
      roughness: 0.25,
      thickness: 0.008,
      ior: 1.4,
      metalness: 0,
      side: THREE.DoubleSide,
    })
  }, [error, reducedTransparency])

  const { borderOpacity } = useSpring({
    borderOpacity: focused ? 0.8 : hovered ? 0.4 : 0.2,
    config: reducedMotion ? { duration: 0 } : { tension: 200, friction: 20 },
  })

  const handlePointerEnter = (e: ThreeEvent<PointerEvent>) => {
    if (disabled) return
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = 'text'
  }

  const handlePointerLeave = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(false)
    document.body.style.cursor = 'auto'
  }

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (disabled) return
    e.stopPropagation()
    setFocused(true)
    onFocus?.()
  }

  const handleBlur = () => {
    setFocused(false)
    onBlur?.()
  }

  const borderColor = error ? '#ff6b6b' : focused ? '#4A90D9' : '#ffffff'

  return (
    <group position={position}>
      {/* Label */}
      {label && (
        <Text
          position={[-width / 2 + 0.02, height / 2 + 0.025, 0.01]}
          fontSize={0.018}
          color={focused ? '#4A90D9' : '#888888'}
          anchorX="left"
          anchorY="middle"
        >
          {label}
        </Text>
      )}

      {/* Textarea body */}
      <RoundedBox
        args={[width, height, 0.008]}
        radius={0.015}
        smoothness={4}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        onPointerMissed={handleBlur}
        material={material}
      />

      {/* Border */}
      <animated.mesh position={[0, 0, 0.005]}>
        <planeGeometry args={[width - 0.01, height - 0.01]} />
        <animated.meshBasicMaterial
          color={borderColor}
          transparent
          opacity={borderOpacity}
          wireframe
          depthWrite={false}
        />
      </animated.mesh>

      {/* Value or placeholder */}
      <Text
        position={[-width / 2 + 0.02, height / 2 - 0.025, 0.01]}
        fontSize={0.02}
        color={value ? '#ffffff' : '#666666'}
        anchorX="left"
        anchorY="top"
        maxWidth={width - 0.04}
        lineHeight={1.4}
      >
        {value || placeholder}
      </Text>
    </group>
  )
}

// ============================================================================
// GlassSelect
// ============================================================================

interface SelectOption {
  value: string
  label: string
}

interface GlassSelectProps {
  label?: string
  placeholder?: string
  options: SelectOption[]
  value?: string
  width?: number
  height?: number
  position?: [number, number, number]
  disabled?: boolean
  error?: boolean
  reducedTransparency?: boolean
  reducedMotion?: boolean
  onChange?: (value: string) => void
}

export function GlassSelect({
  label,
  placeholder = 'Select...',
  options,
  value,
  width = 0.5,
  height = 0.06,
  position = [0, 0, 0],
  disabled = false,
  error = false,
  reducedTransparency = false,
  reducedMotion = false,
  onChange,
}: GlassSelectProps) {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [hoveredOption, setHoveredOption] = useState<string | null>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  const material = useMemo(() => {
    if (reducedTransparency) {
      return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0.1, 0.1, 0.12),
        transparent: true,
        opacity: 0.9,
        roughness: 0.5,
        metalness: 0,
        side: THREE.DoubleSide,
      })
    }

    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(error ? '#ff6b6b' : '#ffffff'),
      transparent: true,
      transmission: 0.75,
      roughness: 0.25,
      thickness: 0.008,
      ior: 1.4,
      metalness: 0,
      side: THREE.DoubleSide,
    })
  }, [error, reducedTransparency])

  const { borderOpacity, dropdownScale } = useSpring({
    borderOpacity: open ? 0.8 : hovered ? 0.4 : 0.2,
    dropdownScale: open ? 1 : 0,
    config: reducedMotion ? { duration: 0 } : { tension: 300, friction: 25 },
  })

  const handlePointerEnter = (e: ThreeEvent<PointerEvent>) => {
    if (disabled) return
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = 'pointer'
  }

  const handlePointerLeave = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(false)
    document.body.style.cursor = 'auto'
  }

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (disabled) return
    e.stopPropagation()
    setOpen(!open)
  }

  const handleOptionClick = (optionValue: string) => {
    onChange?.(optionValue)
    setOpen(false)
  }

  const borderColor = error ? '#ff6b6b' : open ? '#4A90D9' : '#ffffff'

  return (
    <group position={position}>
      {/* Label */}
      {label && (
        <Text
          position={[-width / 2 + 0.02, height / 2 + 0.025, 0.01]}
          fontSize={0.018}
          color={open ? '#4A90D9' : '#888888'}
          anchorX="left"
          anchorY="middle"
        >
          {label}
        </Text>
      )}

      {/* Select field */}
      <RoundedBox
        args={[width, height, 0.008]}
        radius={0.01}
        smoothness={4}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        material={material}
      />

      {/* Border */}
      <animated.mesh position={[0, 0, 0.005]}>
        <planeGeometry args={[width - 0.01, height - 0.01]} />
        <animated.meshBasicMaterial
          color={borderColor}
          transparent
          opacity={borderOpacity}
          wireframe
          depthWrite={false}
        />
      </animated.mesh>

      {/* Selected value or placeholder */}
      <Text
        position={[-width / 2 + 0.02, 0, 0.01]}
        fontSize={0.022}
        color={selectedOption ? '#ffffff' : '#666666'}
        anchorX="left"
        anchorY="middle"
      >
        {selectedOption?.label || placeholder}
      </Text>

      {/* Dropdown arrow */}
      <Text
        position={[width / 2 - 0.03, 0, 0.01]}
        fontSize={0.02}
        color="#888888"
        anchorX="center"
        anchorY="middle"
      >
        {open ? '▲' : '▼'}
      </Text>

      {/* Dropdown options */}
      <animated.group
        position={[0, -height / 2 - 0.02, 0.02]}
        scale-y={dropdownScale}
      >
        {options.map((option, index) => (
          <group
            key={option.value}
            position={[0, -(index + 0.5) * height, 0]}
            onClick={(e) => {
              e.stopPropagation()
              handleOptionClick(option.value)
            }}
            onPointerEnter={() => {
              setHoveredOption(option.value)
              document.body.style.cursor = 'pointer'
            }}
            onPointerLeave={() => {
              setHoveredOption(null)
              document.body.style.cursor = 'auto'
            }}
          >
            <RoundedBox
              args={[width, height, 0.006]}
              radius={0.008}
              smoothness={4}
            >
              <meshPhysicalMaterial
                color={
                  hoveredOption === option.value ? '#2a2a4e' : '#1a1a2e'
                }
                transparent
                opacity={0.95}
              />
            </RoundedBox>
            <Text
              position={[-width / 2 + 0.02, 0, 0.01]}
              fontSize={0.02}
              color={option.value === value ? '#4A90D9' : '#ffffff'}
              anchorX="left"
              anchorY="middle"
            >
              {option.label}
            </Text>
          </group>
        ))}
      </animated.group>
    </group>
  )
}
