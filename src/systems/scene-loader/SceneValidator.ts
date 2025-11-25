/**
 * Scene Validator
 *
 * Validates scene definitions against schema and business rules.
 * Provides detailed error messages and suggestions for fixing issues.
 */

import type {
  SceneDefinition,
  SceneObjectDefinition,
  ValidationResult,
  ValidationIssue,
} from '@/types/sceneDefinition'

export class SceneValidator {
  /**
   * Validate a complete scene definition
   */
  validate(scene: unknown): ValidationResult {
    const errors: ValidationIssue[] = []
    const warnings: ValidationIssue[] = []
    const info: ValidationIssue[] = []

    // Type guard check
    if (!this.isSceneDefinition(scene)) {
      errors.push({
        severity: 'error',
        code: 'INVALID_SCENE_STRUCTURE',
        message: 'Scene definition is missing required fields',
        suggestion: 'Ensure scene has id, name, version, metadata, camera, background, lighting, environment, and objects fields',
      })
      return { valid: false, errors, warnings, info }
    }

    // Validate version format
    if (!this.isValidVersion(scene.version)) {
      errors.push({
        severity: 'error',
        code: 'INVALID_VERSION',
        message: `Invalid version format: ${scene.version}`,
        suggestion: 'Use semantic versioning (e.g., "1.0.0")',
      })
    }

    // Validate metadata
    this.validateMetadata(scene, errors, warnings)

    // Validate camera
    this.validateCamera(scene, errors, warnings)

    // Validate background
    this.validateBackground(scene, errors, warnings)

    // Validate lighting
    this.validateLighting(scene, errors, warnings)

    // Validate objects
    this.validateObjects(scene, errors, warnings, info)

    // Validate object relationships
    this.validateObjectRelationships(scene, errors, warnings)

    // Validate animations
    if (scene.animations) {
      this.validateAnimations(scene, errors, warnings)
    }

    // Performance checks
    this.validatePerformance(scene, warnings, info)

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info,
    }
  }

  /**
   * Type guard for SceneDefinition
   */
  private isSceneDefinition(obj: unknown): obj is SceneDefinition {
    if (typeof obj !== 'object' || obj === null) return false

    const required = ['id', 'name', 'version', 'metadata', 'camera', 'background', 'lighting', 'environment', 'objects']
    return required.every((key) => key in obj)
  }

  /**
   * Validate version string
   */
  private isValidVersion(version: string): boolean {
    return /^\d+\.\d+\.\d+$/.test(version)
  }

  /**
   * Validate color string
   */
  private isValidColor(color: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(color)
  }

  /**
   * Validate Vector3
   */
  private isValidVector3(vec: unknown): vec is [number, number, number] {
    return Array.isArray(vec) && vec.length === 3 && vec.every((v) => typeof v === 'number')
  }

  /**
   * Validate metadata
   */
  private validateMetadata(scene: SceneDefinition, errors: ValidationIssue[], warnings: ValidationIssue[]): void {
    if (!scene.metadata.created) {
      errors.push({
        severity: 'error',
        code: 'MISSING_CREATED_DATE',
        message: 'Metadata is missing created date',
        path: 'metadata.created',
      })
    }

    if (!scene.metadata.modified) {
      errors.push({
        severity: 'error',
        code: 'MISSING_MODIFIED_DATE',
        message: 'Metadata is missing modified date',
        path: 'metadata.modified',
      })
    }

    if (!scene.metadata.description) {
      warnings.push({
        severity: 'warning',
        code: 'MISSING_DESCRIPTION',
        message: 'Scene is missing a description',
        path: 'metadata.description',
        suggestion: 'Add a description to help understand the scene purpose',
      })
    }
  }

  /**
   * Validate camera
   */
  private validateCamera(scene: SceneDefinition, errors: ValidationIssue[], _warnings: ValidationIssue[]): void {
    if (!this.isValidVector3(scene.camera.position)) {
      errors.push({
        severity: 'error',
        code: 'INVALID_CAMERA_POSITION',
        message: 'Camera position must be a valid Vector3 [x, y, z]',
        path: 'camera.position',
      })
    }

    if (scene.camera.fov < 1 || scene.camera.fov > 179) {
      errors.push({
        severity: 'error',
        code: 'INVALID_FOV',
        message: `Field of view must be between 1 and 179 degrees, got ${scene.camera.fov}`,
        path: 'camera.fov',
        suggestion: 'Use a value between 40-70 for realistic perspective',
      })
    }

    if (scene.camera.near && scene.camera.far && scene.camera.near >= scene.camera.far) {
      errors.push({
        severity: 'error',
        code: 'INVALID_CAMERA_PLANES',
        message: 'Camera near plane must be less than far plane',
        path: 'camera',
      })
    }
  }

  /**
   * Validate background
   */
  private validateBackground(scene: SceneDefinition, errors: ValidationIssue[], warnings: ValidationIssue[]): void {
    const bg = scene.background

    if (bg.type === 'color' && bg.color && !this.isValidColor(bg.color)) {
      errors.push({
        severity: 'error',
        code: 'INVALID_COLOR',
        message: `Invalid color format: ${bg.color}`,
        path: 'background.color',
        suggestion: 'Use hex color format (e.g., #0a0a12)',
      })
    }

    if (bg.type === 'gradient') {
      if (!bg.gradient) {
        errors.push({
          severity: 'error',
          code: 'MISSING_GRADIENT',
          message: 'Background type is gradient but gradient definition is missing',
          path: 'background.gradient',
        })
      } else {
        if (bg.gradient.colors.length < 2) {
          errors.push({
            severity: 'error',
            code: 'INSUFFICIENT_GRADIENT_COLORS',
            message: 'Gradient requires at least 2 colors',
            path: 'background.gradient.colors',
          })
        }

        bg.gradient.colors.forEach((color, index) => {
          if (!this.isValidColor(color)) {
            errors.push({
              severity: 'error',
              code: 'INVALID_COLOR',
              message: `Invalid gradient color at index ${index}: ${color}`,
              path: `background.gradient.colors[${index}]`,
            })
          }
        })
      }
    }

    if ((bg.type === 'sphere' || bg.type === 'hemisphere') && !bg.sphere) {
      errors.push({
        severity: 'error',
        code: 'MISSING_SPHERE_DEFINITION',
        message: `Background type is ${bg.type} but sphere definition is missing`,
        path: 'background.sphere',
      })
    }

    if (bg.stars && bg.stars.enabled) {
      if (bg.stars.count > 10000) {
        warnings.push({
          severity: 'warning',
          code: 'HIGH_STAR_COUNT',
          message: `Star count ${bg.stars.count} may impact performance`,
          path: 'background.stars.count',
          suggestion: 'Consider reducing to 5000 or less',
        })
      }
    }
  }

  /**
   * Validate lighting
   */
  private validateLighting(scene: SceneDefinition, errors: ValidationIssue[], warnings: ValidationIssue[]): void {
    const lighting = scene.lighting

    if (!lighting.ambient && (!lighting.directional || lighting.directional.length === 0) && (!lighting.point || lighting.point.length === 0)) {
      warnings.push({
        severity: 'warning',
        code: 'NO_LIGHTS',
        message: 'Scene has no lights defined',
        suggestion: 'Add at least ambient or directional lighting',
      })
    }

    if (lighting.directional) {
      lighting.directional.forEach((light, index) => {
        if (!this.isValidVector3(light.position)) {
          errors.push({
            severity: 'error',
            code: 'INVALID_LIGHT_POSITION',
            message: `Directional light ${index} has invalid position`,
            path: `lighting.directional[${index}].position`,
          })
        }

        if (light.color && !this.isValidColor(light.color)) {
          errors.push({
            severity: 'error',
            code: 'INVALID_COLOR',
            message: `Invalid light color: ${light.color}`,
            path: `lighting.directional[${index}].color`,
          })
        }
      })
    }

    if (lighting.point) {
      lighting.point.forEach((light, index) => {
        if (!this.isValidVector3(light.position)) {
          errors.push({
            severity: 'error',
            code: 'INVALID_LIGHT_POSITION',
            message: `Point light ${index} has invalid position`,
            path: `lighting.point[${index}].position`,
          })
        }
      })
    }
  }

  /**
   * Validate objects
   */
  private validateObjects(scene: SceneDefinition, errors: ValidationIssue[], warnings: ValidationIssue[], info: ValidationIssue[]): void {
    if (scene.objects.length === 0) {
      warnings.push({
        severity: 'warning',
        code: 'EMPTY_SCENE',
        message: 'Scene has no objects',
        suggestion: 'Add objects to the scene',
      })
      return
    }

    const ids = new Set<string>()

    scene.objects.forEach((obj, index) => {
      // Check for duplicate IDs
      if (ids.has(obj.id)) {
        errors.push({
          severity: 'error',
          code: 'DUPLICATE_OBJECT_ID',
          message: `Duplicate object ID: ${obj.id}`,
          objectId: obj.id,
          suggestion: 'Ensure all object IDs are unique',
        })
      }
      ids.add(obj.id)

      // Validate transform
      if (!this.isValidVector3(obj.transform.position)) {
        errors.push({
          severity: 'error',
          code: 'INVALID_POSITION',
          message: `Object ${obj.id} has invalid position`,
          objectId: obj.id,
          path: `objects[${index}].transform.position`,
        })
      }

      if (!this.isValidVector3(obj.transform.rotation)) {
        errors.push({
          severity: 'error',
          code: 'INVALID_ROTATION',
          message: `Object ${obj.id} has invalid rotation`,
          objectId: obj.id,
          path: `objects[${index}].transform.rotation`,
        })
      }

      if (!this.isValidVector3(obj.transform.scale)) {
        errors.push({
          severity: 'error',
          code: 'INVALID_SCALE',
          message: `Object ${obj.id} has invalid scale`,
          objectId: obj.id,
          path: `objects[${index}].transform.scale`,
        })
      }

      // Validate type-specific properties
      if ((obj.type === 'GlassButton' || obj.type === 'GlassCard' || obj.type === 'GlassPanel') && !obj.glassProps) {
        warnings.push({
          severity: 'warning',
          code: 'MISSING_GLASS_PROPS',
          message: `Object ${obj.id} is type ${obj.type} but has no glassProps`,
          objectId: obj.id,
          suggestion: 'Add glassProps for glass components',
        })
      }

      if (obj.type === 'mesh' && !obj.geometry) {
        errors.push({
          severity: 'error',
          code: 'MISSING_GEOMETRY',
          message: `Mesh object ${obj.id} has no geometry`,
          objectId: obj.id,
          path: `objects[${index}].geometry`,
        })
      }

      // Validate material colors
      if (obj.material) {
        if (obj.material.color && !this.isValidColor(obj.material.color)) {
          errors.push({
            severity: 'error',
            code: 'INVALID_COLOR',
            message: `Invalid material color: ${obj.material.color}`,
            objectId: obj.id,
            path: `objects[${index}].material.color`,
          })
        }

        if (obj.material.emissive && !this.isValidColor(obj.material.emissive)) {
          errors.push({
            severity: 'error',
            code: 'INVALID_COLOR',
            message: `Invalid emissive color: ${obj.material.emissive}`,
            objectId: obj.id,
            path: `objects[${index}].material.emissive`,
          })
        }
      }

      // Validate interactions
      if (obj.interactions) {
        if (obj.interactions.onClick?.type === 'navigate' && !obj.interactions.onClick.target) {
          errors.push({
            severity: 'error',
            code: 'MISSING_NAVIGATION_TARGET',
            message: `Object ${obj.id} has navigate interaction but no target`,
            objectId: obj.id,
            suggestion: 'Add target property with node ID',
          })
        }
      }

      // Recursively validate children
      if (obj.children && obj.children.length > 0) {
        this.validateObjectArray(obj.children, ids, errors, warnings, `objects[${index}].children`)
      }
    })

    // Info about object count
    info.push({
      severity: 'info',
      code: 'OBJECT_COUNT',
      message: `Scene contains ${ids.size} objects`,
      data: { count: ids.size },
    })
  }

  /**
   * Validate array of objects (including children)
   */
  private validateObjectArray(
    objects: SceneObjectDefinition[],
    existingIds: Set<string>,
    errors: ValidationIssue[],
    warnings: ValidationIssue[],
    pathPrefix: string
  ): void {
    objects.forEach((obj, index) => {
      if (existingIds.has(obj.id)) {
        errors.push({
          severity: 'error',
          code: 'DUPLICATE_OBJECT_ID',
          message: `Duplicate object ID: ${obj.id}`,
          objectId: obj.id,
          path: `${pathPrefix}[${index}]`,
        })
      }
      existingIds.add(obj.id)

      if (obj.children && obj.children.length > 0) {
        this.validateObjectArray(obj.children, existingIds, errors, warnings, `${pathPrefix}[${index}].children`)
      }
    })
  }

  /**
   * Validate object relationships
   */
  private validateObjectRelationships(scene: SceneDefinition, errors: ValidationIssue[], _warnings: ValidationIssue[]): void {
    const ids = this.getAllObjectIds(scene.objects)

    scene.objects.forEach((obj) => {
      // Validate parentId references
      if (obj.parentId && !ids.has(obj.parentId)) {
        errors.push({
          severity: 'error',
          code: 'INVALID_PARENT_REFERENCE',
          message: `Object ${obj.id} references non-existent parent ${obj.parentId}`,
          objectId: obj.id,
          suggestion: 'Remove parentId or create the referenced parent object',
        })
      }

      // Validate constraint targets
      if (obj.constraints) {
        obj.constraints.forEach((constraint, index) => {
          if (constraint.target !== 'camera' && !ids.has(constraint.target)) {
            errors.push({
              severity: 'error',
              code: 'INVALID_CONSTRAINT_TARGET',
              message: `Object ${obj.id} constraint ${index} references non-existent target ${constraint.target}`,
              objectId: obj.id,
              suggestion: 'Update constraint target to existing object or "camera"',
            })
          }
        })
      }

      // Check for circular parent references
      if (obj.parentId) {
        const visited = new Set<string>()
        let current: string | null | undefined = obj.parentId
        while (current) {
          if (visited.has(current)) {
            errors.push({
              severity: 'error',
              code: 'CIRCULAR_PARENT_REFERENCE',
              message: `Object ${obj.id} has circular parent reference`,
              objectId: obj.id,
              suggestion: 'Remove circular parent relationship',
            })
            break
          }
          visited.add(current)
          const parent = this.findObjectById(scene.objects, current)
          current = parent?.parentId || null
        }
      }
    })
  }

  /**
   * Validate animations
   */
  private validateAnimations(scene: SceneDefinition, errors: ValidationIssue[], _warnings: ValidationIssue[]): void {
    if (!scene.animations) return

    if (scene.animations.sequences) {
      const ids = this.getAllObjectIds(scene.objects)

      scene.animations.sequences.forEach((sequence, seqIndex) => {
        sequence.timeline.forEach((entry, entryIndex) => {
          if (!ids.has(entry.objectId)) {
            errors.push({
              severity: 'error',
              code: 'INVALID_ANIMATION_TARGET',
              message: `Animation sequence "${sequence.name}" references non-existent object ${entry.objectId}`,
              path: `animations.sequences[${seqIndex}].timeline[${entryIndex}].objectId`,
              suggestion: 'Update objectId to existing object',
            })
          }

          if (entry.startTime < 0) {
            errors.push({
              severity: 'error',
              code: 'INVALID_START_TIME',
              message: `Animation entry has negative start time: ${entry.startTime}`,
              path: `animations.sequences[${seqIndex}].timeline[${entryIndex}].startTime`,
            })
          }
        })
      })
    }
  }

  /**
   * Validate performance
   */
  private validatePerformance(scene: SceneDefinition, warnings: ValidationIssue[], _info: ValidationIssue[]): void {
    const objectCount = this.getAllObjectIds(scene.objects).size

    if (objectCount > 100) {
      warnings.push({
        severity: 'warning',
        code: 'HIGH_OBJECT_COUNT',
        message: `Scene has ${objectCount} objects, which may impact performance`,
        suggestion: 'Consider grouping objects or using instancing',
        data: { objectCount },
      })
    }

    // Check for expensive features
    const transparentObjects = this.countTransparentObjects(scene.objects)
    if (transparentObjects > 20) {
      warnings.push({
        severity: 'warning',
        code: 'MANY_TRANSPARENT_OBJECTS',
        message: `Scene has ${transparentObjects} transparent objects, which may cause overdraw`,
        suggestion: 'Reduce transparency or use opaque materials where possible',
        data: { transparentObjects },
      })
    }
  }

  /**
   * Get all object IDs (including children)
   */
  private getAllObjectIds(objects: SceneObjectDefinition[]): Set<string> {
    const ids = new Set<string>()

    const addIds = (objs: SceneObjectDefinition[]) => {
      objs.forEach((obj) => {
        ids.add(obj.id)
        if (obj.children) {
          addIds(obj.children)
        }
      })
    }

    addIds(objects)
    return ids
  }

  /**
   * Find object by ID
   */
  private findObjectById(objects: SceneObjectDefinition[], id: string): SceneObjectDefinition | null {
    for (const obj of objects) {
      if (obj.id === id) return obj
      if (obj.children) {
        const found = this.findObjectById(obj.children, id)
        if (found) return found
      }
    }
    return null
  }

  /**
   * Count transparent objects
   */
  private countTransparentObjects(objects: SceneObjectDefinition[]): number {
    let count = 0

    const countInArray = (objs: SceneObjectDefinition[]) => {
      objs.forEach((obj) => {
        if (obj.material?.transparent || (obj.material?.transmission && obj.material.transmission > 0)) {
          count++
        }
        if (obj.children) {
          countInArray(obj.children)
        }
      })
    }

    countInArray(objects)
    return count
  }
}

// Export singleton instance
export const sceneValidator = new SceneValidator()
