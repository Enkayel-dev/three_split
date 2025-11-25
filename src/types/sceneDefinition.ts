/**
 * Scene Definition Types
 *
 * Complete TypeScript interfaces for defining 3D scenes in JSON format.
 * These types represent the data structure for the dynamic scene builder system.
 */

// ============================================================================
// Core Scene Definition
// ============================================================================

export interface SceneDefinition {
  id: string
  name: string
  version: string
  metadata: SceneMetadata

  camera: CameraDefinition
  background: BackgroundDefinition
  lighting: LightingDefinition
  environment: EnvironmentDefinition

  objects: SceneObjectDefinition[]
  animations?: SceneAnimations
}

export interface SceneMetadata {
  author?: string
  description?: string
  created: string
  modified: string
  tags?: string[]
}

// ============================================================================
// Camera
// ============================================================================

export interface CameraDefinition {
  position: [number, number, number]
  fov: number
  near?: number
  far?: number
  target?: [number, number, number]
}

// ============================================================================
// Background
// ============================================================================

export type BackgroundType = 'color' | 'gradient' | 'sphere' | 'hemisphere' | 'skybox'
export type GradientDirection = 'vertical' | 'horizontal' | 'radial'

export interface BackgroundDefinition {
  type: BackgroundType

  // For color type
  color?: string

  // For gradient type
  gradient?: GradientDefinition

  // For sphere/hemisphere type
  sphere?: SphereBackgroundDefinition

  // Additional effects
  stars?: StarsDefinition
  grid?: GridDefinition
}

export interface GradientDefinition {
  colors: string[]
  stops?: number[]
  direction?: GradientDirection
}

export interface SphereBackgroundDefinition {
  radius: number
  segments?: number
  material: SphereBackgroundMaterial
  invertNormals?: boolean // true for inside view
}

export type SphereBackgroundMaterialType = 'shader' | 'texture' | 'color' | 'gradient'

export interface SphereBackgroundMaterial {
  type: SphereBackgroundMaterialType

  // For shader type
  shader?: {
    vertex?: string
    fragment: string
    uniforms?: Record<string, unknown>
  }

  // For texture type
  texture?: string

  // For color type
  color?: string

  // For gradient type
  gradient?: GradientDefinition
}

export interface StarsDefinition {
  enabled: boolean
  count: number
  radius: number
  depth?: number
  speed?: number
  saturation?: number
  fade?: boolean
}

export interface GridDefinition {
  enabled: boolean
  position?: [number, number, number]
  cellSize: number
  cellThickness?: number
  cellColor?: string
  sectionSize?: number
  sectionThickness?: number
  sectionColor?: string
  fadeDistance: number
  fadeStrength?: number
  followCamera?: boolean
  infiniteGrid?: boolean
}

// ============================================================================
// Lighting
// ============================================================================

export interface LightingDefinition {
  ambient?: AmbientLightDefinition
  directional?: DirectionalLightDefinition[]
  point?: PointLightDefinition[]
  spot?: SpotLightDefinition[]
}

export interface AmbientLightDefinition {
  intensity: number
  color?: string
}

export interface DirectionalLightDefinition {
  position: [number, number, number]
  intensity: number
  color?: string
  castShadow?: boolean
  shadowMapSize?: number
}

export interface PointLightDefinition {
  position: [number, number, number]
  intensity: number
  color?: string
  distance?: number
  decay?: number
}

export interface SpotLightDefinition {
  position: [number, number, number]
  target: [number, number, number]
  intensity: number
  color?: string
  angle?: number
  penumbra?: number
  distance?: number
  decay?: number
  castShadow?: boolean
}

// ============================================================================
// Environment
// ============================================================================

export interface EnvironmentDefinition {
  preset?: string // drei Environment presets: 'city', 'sunset', 'dawn', 'night', 'warehouse', 'forest', 'apartment', 'studio', 'park', 'lobby'
  background?: boolean
  blur?: number
  files?: string[] // Custom HDR/EXR files
}

// ============================================================================
// Scene Objects
// ============================================================================

export type SceneObjectType = 'GlassButton' | 'GlassCard' | 'GlassPanel' | 'mesh' | 'group'
export type GeometryType = 'box' | 'sphere' | 'cylinder' | 'plane' | 'icosahedron' | 'torus' | 'cone' | 'dodecahedron' | 'octahedron' | 'tetrahedron' | 'torusKnot'
export type MaterialType = 'MeshPhysicalMaterial' | 'MeshStandardMaterial' | 'MeshBasicMaterial' | 'MeshLambertMaterial' | 'MeshPhongMaterial'

export interface SceneObjectDefinition {
  id: string
  type: SceneObjectType
  name?: string

  transform: TransformDefinition

  // Glass component props (for GlassButton, GlassCard, GlassPanel)
  glassProps?: GlassComponentProps

  // Material properties (for mesh type or material overrides)
  material?: MaterialDefinition

  // Geometry (for mesh type)
  geometry?: GeometryDefinition

  // Interaction handlers
  interactions?: InteractionDefinition

  // Animation configuration
  animations?: ObjectAnimationDefinition

  // Children (for group type)
  children?: SceneObjectDefinition[]

  // Visibility and rendering
  visible: boolean
  renderOrder?: number
  castShadow?: boolean
  receiveShadow?: boolean

  // Constraints and relationships
  parentId?: string
  constraints?: ConstraintDefinition[]

  // Custom user data
  userData?: Record<string, unknown>
}

export interface TransformDefinition {
  position: [number, number, number]
  rotation: [number, number, number] // Euler angles in radians
  scale: [number, number, number]
}

export interface GlassComponentProps {
  // GlassCard props
  width?: number
  height?: number
  thickness?: number
  title?: string
  subtitle?: string

  // GlassButton props
  label?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean

  // GlassPanel props
  // (shares width, height, thickness with GlassCard)
}

export interface MaterialDefinition {
  type?: MaterialType

  // Common properties
  color?: string
  opacity?: number
  transparent?: boolean
  side?: 'front' | 'back' | 'double'

  // Physical material properties
  transmission?: number
  roughness?: number
  metalness?: number
  ior?: number
  thickness?: number

  // Emissive properties
  emissive?: string
  emissiveIntensity?: number

  // Clearcoat properties
  clearcoat?: number
  clearcoatRoughness?: number

  // Environment properties
  envMapIntensity?: number

  // Attenuation (for transmission)
  attenuationColor?: string
  attenuationDistance?: number

  // Texture maps (file paths)
  map?: string
  normalMap?: string
  roughnessMap?: string
  metalnessMap?: string
  aoMap?: string
  emissiveMap?: string

  // Other properties
  wireframe?: boolean
  flatShading?: boolean
  fog?: boolean
}

export interface GeometryDefinition {
  type: GeometryType
  args: number[] // Constructor arguments for geometry
}

export interface InteractionDefinition {
  onClick?: ClickInteraction
  onHover?: HoverInteraction
  onDoubleClick?: ClickInteraction
}

export type InteractionType = 'navigate' | 'animate' | 'material' | 'custom' | 'none'

export interface ClickInteraction {
  type: InteractionType
  target?: string // For navigate: node ID, for animate: animation name
  animation?: string
  materialChanges?: Partial<MaterialDefinition>
  customHandler?: string // Custom function name
}

export interface HoverInteraction {
  type: InteractionType
  animation?: string
  materialChanges?: Partial<MaterialDefinition>
  params?: Record<string, unknown>
}

export interface ObjectAnimationDefinition {
  enabled: boolean
  types: string[] // Available animation types for this object
  autoPlay?: string[] // Animation names to play on mount
  defaultParams?: Record<string, unknown>
}

export type ConstraintType = 'lookAt' | 'maintainDistance' | 'alignWith' | 'followPath' | 'attachToParent'

export interface ConstraintDefinition {
  type: ConstraintType
  target: string // Target object ID or special targets like 'camera'
  params?: Record<string, unknown>
}

// ============================================================================
// Scene Animations
// ============================================================================

export interface SceneAnimations {
  ambient?: AmbientAnimationDefinition
  sequences?: AnimationSequenceDefinition[]
}

export type AmbientAnimationType = 'rotation' | 'float' | 'pulse' | 'drift'

export interface AmbientAnimationDefinition {
  enabled: boolean
  type: AmbientAnimationType
  params: Record<string, unknown>
}

export interface AnimationSequenceDefinition {
  name: string
  description?: string
  timeline: TimelineEntry[]
  loop?: boolean
  autoPlay?: boolean
}

export interface TimelineEntry {
  objectId: string
  animation: string
  startTime: number // milliseconds
  duration?: number // milliseconds
  easing?: EasingType
  params?: Record<string, unknown>
}

export type EasingType = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce' | 'elastic'

// ============================================================================
// Material Presets
// ============================================================================

export interface MaterialPreset {
  name: string
  category: MaterialPresetCategory
  description?: string
  material: MaterialDefinition
  tags?: string[]
  thumbnail?: string
}

export type MaterialPresetCategory = 'glass' | 'holographic' | 'metallic' | 'neon' | 'custom'

export interface MaterialPresetLibrary {
  category: MaterialPresetCategory
  presets: Record<string, MaterialPreset>
}

// ============================================================================
// Layout Definitions
// ============================================================================

export type LayoutPattern = 'circular' | 'grid' | 'line' | 'spiral' | 'radial'

export interface LayoutDefinition {
  pattern: LayoutPattern
  params: CircularLayoutParams | GridLayoutParams | LineLayoutParams | SpiralLayoutParams | RadialLayoutParams
}

export interface CircularLayoutParams {
  radius: number
  centerPosition: [number, number, number]
  startAngle?: number
  endAngle?: number
  rotateToFaceCenter?: boolean
  height?: number // Y offset for each item
}

export interface GridLayoutParams {
  columns: number
  rows?: number
  spacingX: number
  spacingZ: number
  centerPosition: [number, number, number]
  alignment?: 'left' | 'center' | 'right'
}

export interface LineLayoutParams {
  axis: 'x' | 'y' | 'z'
  spacing: number
  startPosition: [number, number, number]
  alignment?: 'start' | 'center' | 'end'
}

export interface SpiralLayoutParams {
  revolutions: number
  radiusGrowth: number
  heightGrowth: number
  centerPosition: [number, number, number]
  startRadius?: number
}

export interface RadialLayoutParams {
  centerObject?: string
  spokeLength: number
  spokeAngles?: number[]
  spokeCount?: number
  centerPosition?: [number, number, number]
}

// ============================================================================
// Validation & Quality
// ============================================================================

export interface ValidationResult {
  valid: boolean
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
  info: ValidationIssue[]
}

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info'
  code: string
  message: string
  objectId?: string
  objectIds?: string[]
  path?: string
  suggestion?: string
  data?: Record<string, unknown>
}

export interface PerformanceAnalysis {
  objectCount: number
  triangleCount: number
  estimatedFPS: number
  bottlenecks: PerformanceBottleneck[]
  recommendations: string[]
}

export interface PerformanceBottleneck {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  suggestion?: string
  affectedObjects?: string[]
}

// ============================================================================
// Change History & Staging
// ============================================================================

export interface ChangeHistoryEntry {
  id: string
  timestamp: string
  action: ChangeAction
  details: Record<string, unknown>
  canUndo: boolean
  canRedo: boolean
}

export type ChangeAction =
  | 'add_object'
  | 'remove_object'
  | 'update_object'
  | 'update_material'
  | 'update_transform'
  | 'add_constraint'
  | 'remove_constraint'
  | 'update_background'
  | 'update_lighting'
  | 'batch_update'
  | 'layout_applied'

export interface StagingBranch {
  name: string
  description?: string
  created: string
  lastModified: string
  changeCount: number
  branchedFrom?: string
  scene: SceneDefinition
}

// ============================================================================
// Spatial Analysis
// ============================================================================

export interface SpatialMeasurement {
  distance: number
  units: 'meters' | 'world_units'
  vector: [number, number, number]
  angle: {
    horizontal: number // degrees
    vertical: number // degrees
  }
}

export interface ViewportBounds {
  frustum: {
    near: number
    far: number
    left: number
    right: number
    top: number
    bottom: number
  }
  visibleObjects: VisibleObjectInfo[]
  center: [number, number, number]
  worldBounds: {
    min: [number, number, number]
    max: [number, number, number]
  }
}

export interface VisibleObjectInfo {
  id: string
  percentageVisible: number
  inFocus: boolean
  reason?: string
}

export interface RelationshipAnalysis {
  objectId: string
  position: [number, number, number]
  nearbyObjects: NearbyObjectInfo[]
  inViewport: boolean
  occludedBy: string[]
}

export interface NearbyObjectInfo {
  id: string
  distance: number
  direction: string
  relativePosition: [number, number, number]
  alignment: {
    sameX?: boolean
    sameY?: boolean
    sameZ?: boolean
  }
}

// ============================================================================
// Query Definitions
// ============================================================================

export interface SceneQuery {
  type?: SceneObjectType
  name?: string | RegExp
  tag?: string
  visible?: boolean
  material?: MaterialQuery
  position?: PositionQuery
  custom?: Record<string, unknown>
}

export interface MaterialQuery {
  transmission?: NumericQuery
  roughness?: NumericQuery
  metalness?: NumericQuery
  emissiveIntensity?: NumericQuery
  color?: string
}

export interface PositionQuery {
  x?: NumericQuery
  y?: NumericQuery
  z?: NumericQuery
}

export interface NumericQuery {
  $eq?: number // equals
  $ne?: number // not equals
  $gt?: number // greater than
  $gte?: number // greater than or equal
  $lt?: number // less than
  $lte?: number // less than or equal
  $between?: [number, number] // between min and max
}

export interface RegionQuery {
  type: 'sphere' | 'box' | 'cylinder'
  center: [number, number, number]

  // For sphere
  radius?: number

  // For box
  dimensions?: [number, number, number] // width, height, depth

  // For cylinder
  height?: number
  // radius also used for cylinder
}

// ============================================================================
// Utility Types
// ============================================================================

export type Vector3 = [number, number, number]
export type Euler3 = [number, number, number]
export type Color = string // Hex color string
export type UUID = string

// Type guards
export function isSceneDefinition(obj: unknown): obj is SceneDefinition {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'version' in obj &&
    'camera' in obj &&
    'background' in obj &&
    'lighting' in obj &&
    'objects' in obj
  )
}

export function isSceneObjectDefinition(obj: unknown): obj is SceneObjectDefinition {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'type' in obj &&
    'transform' in obj &&
    'visible' in obj
  )
}
