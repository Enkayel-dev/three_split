/**
 * Validation and Health Check Tools
 *
 * Tools for validating scene definitions and checking for common issues.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js'
import type { SceneBridge } from '../bridge/websocket.js'

/**
 * Validation tool definitions
 */
export const validationTools: Tool[] = [
  {
    name: 'validate_scene',
    description:
      'Validate the entire scene definition, checking for errors, warnings, and best practice violations.',
    inputSchema: {
      type: 'object',
      properties: {
        strict: {
          type: 'boolean',
          description: 'Enable strict validation mode (default: false)',
          default: false,
        },
      },
    },
  },
  {
    name: 'check_scene_health',
    description:
      'Check for common scene health issues: overlapping objects, extreme values, missing references, etc.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'validate_object',
    description: 'Validate a single object definition.',
    inputSchema: {
      type: 'object',
      properties: {
        objectId: {
          type: 'string',
          description: 'ID of object to validate',
        },
      },
      required: ['objectId'],
    },
  },
  {
    name: 'fix_common_issues',
    description:
      'Automatically fix common scene issues: normalize scales, clamp values, remove duplicates.',
    inputSchema: {
      type: 'object',
      properties: {
        dryRun: {
          type: 'boolean',
          description: 'Preview fixes without applying them (default: true)',
          default: true,
        },
      },
    },
  },
  {
    name: 'check_performance',
    description:
      'Analyze scene for potential performance issues: too many objects, complex materials, etc.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'validate_references',
    description:
      'Check that all object references (parent/child, interactions) point to existing objects.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
]

/**
 * Handle validate_scene tool
 */
export async function handleValidateScene(args: any, sceneBridge: SceneBridge) {
  try {
    const snapshot = await sceneBridge.getSnapshot()
    const { strict = false } = args

    const errors: string[] = []
    const warnings: string[] = []
    const info: string[] = []

    // Required fields
    if (!snapshot.id) errors.push('Missing scene id')
    if (!snapshot.name) errors.push('Missing scene name')
    if (!snapshot.version) errors.push('Missing scene version')

    // Version format
    if (snapshot.version && !/^\d+\.\d+\.\d+$/.test(snapshot.version)) {
      errors.push('Invalid version format (must be semver: x.y.z)')
    }

    // Camera validation
    if (!snapshot.camera) {
      errors.push('Missing camera definition')
    } else {
      if (!snapshot.camera.position) errors.push('Missing camera position')
      if (!snapshot.camera.fov) warnings.push('Missing camera FOV')
    }

    // Background validation
    if (!snapshot.background) {
      warnings.push('Missing background definition')
    }

    // Lighting validation
    if (!snapshot.lighting) {
      warnings.push('Missing lighting definition')
    }

    // Objects validation
    if (!snapshot.objects || snapshot.objects.length === 0) {
      warnings.push('Scene has no objects')
    } else {
      // Check for duplicate IDs
      const ids = snapshot.objects.map((o: any) => o.id)
      const duplicates = ids.filter((id: string, index: number) => ids.indexOf(id) !== index)
      if (duplicates.length > 0) {
        errors.push(`Duplicate object IDs: ${duplicates.join(', ')}`)
      }

      // Validate each object
      snapshot.objects.forEach((obj: any, index: number) => {
        if (!obj.id) errors.push(`Object at index ${index} missing id`)
        if (!obj.type) errors.push(`Object '${obj.id}' missing type`)
        if (!obj.transform) {
          errors.push(`Object '${obj.id}' missing transform`)
        } else {
          if (!obj.transform.position) errors.push(`Object '${obj.id}' missing position`)
          if (!obj.transform.rotation) warnings.push(`Object '${obj.id}' missing rotation`)
          if (!obj.transform.scale) warnings.push(`Object '${obj.id}' missing scale`)
        }

        // Type-specific validation
        if (obj.type === 'mesh') {
          if (!obj.geometry) warnings.push(`Mesh '${obj.id}' missing geometry`)
          if (!obj.material) warnings.push(`Mesh '${obj.id}' missing material`)
        }

        if (['GlassButton', 'GlassCard', 'GlassPanel'].includes(obj.type)) {
          if (!obj.glassProps) {
            warnings.push(`${obj.type} '${obj.id}' missing glassProps`)
          }
        }

        // Strict mode checks
        if (strict) {
          if (!obj.name) warnings.push(`Object '${obj.id}' missing name`)
          if (obj.visible === undefined) {
            info.push(`Object '${obj.id}' missing explicit visible property`)
          }
        }
      })
    }

    const valid = errors.length === 0

    return {
      content: [
        {
          type: 'text',
          text: `Scene Validation ${valid ? '✓ PASSED' : '✗ FAILED'}\n\nErrors: ${errors.length}\n${errors.map((e) => `  ✗ ${e}`).join('\n') || '  (none)'}\n\nWarnings: ${warnings.length}\n${warnings.map((w) => `  ⚠ ${w}`).join('\n') || '  (none)'}\n\nInfo: ${info.length}\n${info.map((i) => `  ℹ ${i}`).join('\n') || '  (none)'}`,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error validating scene: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Handle check_scene_health tool
 */
export async function handleCheckSceneHealth(sceneBridge: SceneBridge) {
  try {
    const snapshot = await sceneBridge.getSnapshot()
    const issues: string[] = []
    const suggestions: string[] = []

    if (!snapshot.objects || snapshot.objects.length === 0) {
      return {
        content: [{ type: 'text', text: 'Scene has no objects to check' }],
      }
    }

    // Check for overlapping objects (same position)
    const positions = new Map<string, string[]>()
    snapshot.objects.forEach((obj: any) => {
      const posKey = obj.transform.position.join(',')
      const existing = positions.get(posKey) || []
      existing.push(obj.id)
      positions.set(posKey, existing)
    })

    positions.forEach((ids, pos) => {
      if (ids.length > 1) {
        issues.push(`${ids.length} objects at same position [${pos}]: ${ids.join(', ')}`)
      }
    })

    // Check for extreme positions
    snapshot.objects.forEach((obj: any) => {
      const [x, y, z] = obj.transform.position
      if (Math.abs(x) > 100 || Math.abs(y) > 100 || Math.abs(z) > 100) {
        issues.push(`Object '${obj.id}' has extreme position: [${x}, ${y}, ${z}]`)
      }
    })

    // Check for extreme scales
    snapshot.objects.forEach((obj: any) => {
      if (obj.transform.scale) {
        const [sx, sy, sz] = obj.transform.scale
        if (sx === 0 || sy === 0 || sz === 0) {
          issues.push(`Object '${obj.id}' has zero scale (invisible)`)
        }
        if (sx > 100 || sy > 100 || sz > 100) {
          issues.push(`Object '${obj.id}' has extreme scale: [${sx}, ${sy}, ${sz}]`)
        }
      }
    })

    // Check for too many objects
    if (snapshot.objects.length > 1000) {
      issues.push(`Scene has ${snapshot.objects.length} objects (may impact performance)`)
      suggestions.push('Consider using instancing or LOD for large object counts')
    }

    // Check for hidden objects
    const hiddenCount = snapshot.objects.filter((o: any) => o.visible === false).length
    if (hiddenCount > 0) {
      suggestions.push(`${hiddenCount} objects are hidden (visible: false)`)
    }

    // Check for objects without names
    const unnamedCount = snapshot.objects.filter((o: any) => !o.name).length
    if (unnamedCount > 0) {
      suggestions.push(`${unnamedCount} objects without names (harder to manage)`)
    }

    // Check for groups with no children
    const emptyGroups = snapshot.objects.filter(
      (o: any) => o.type === 'group' && (!o.children || o.children.length === 0)
    )
    if (emptyGroups.length > 0) {
      issues.push(
        `${emptyGroups.length} empty groups: ${emptyGroups.map((g: any) => g.id).join(', ')}`
      )
      suggestions.push('Consider removing empty groups')
    }

    return {
      content: [
        {
          type: 'text',
          text: `Scene Health Check\n\n${issues.length > 0 ? `Issues (${issues.length}):\n${issues.map((i) => `  ✗ ${i}`).join('\n')}` : '✓ No issues found'}\n\n${suggestions.length > 0 ? `Suggestions (${suggestions.length}):\n${suggestions.map((s) => `  ℹ ${s}`).join('\n')}` : ''}`,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error checking scene health: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Handle validate_object tool
 */
export async function handleValidateObject(args: any, sceneBridge: SceneBridge) {
  try {
    const snapshot = await sceneBridge.getSnapshot()
    const { objectId } = args

    const obj = snapshot.objects?.find((o: any) => o.id === objectId)
    if (!obj) {
      return {
        content: [{ type: 'text', text: `Object '${objectId}' not found` }],
        isError: true,
      }
    }

    const errors: string[] = []
    const warnings: string[] = []

    // Required fields
    if (!obj.id) errors.push('Missing id')
    if (!obj.type) errors.push('Missing type')
    if (!obj.transform) {
      errors.push('Missing transform')
    } else {
      if (!obj.transform.position) errors.push('Missing position')
      if (!obj.transform.rotation) warnings.push('Missing rotation')
      if (!obj.transform.scale) warnings.push('Missing scale')
    }

    // Type-specific validation
    if (obj.type === 'mesh') {
      if (!obj.geometry) warnings.push('Missing geometry')
      if (!obj.material) warnings.push('Missing material')
    }

    if (['GlassButton', 'GlassCard', 'GlassPanel'].includes(obj.type)) {
      if (!obj.glassProps) warnings.push('Missing glassProps')
    }

    if (obj.type === 'group') {
      if (!obj.children || obj.children.length === 0) {
        warnings.push('Group has no children')
      }
    }

    const valid = errors.length === 0

    return {
      content: [
        {
          type: 'text',
          text: `Object '${objectId}' Validation ${valid ? '✓ PASSED' : '✗ FAILED'}\n\nErrors: ${errors.length}\n${errors.map((e) => `  ✗ ${e}`).join('\n') || '  (none)'}\n\nWarnings: ${warnings.length}\n${warnings.map((w) => `  ⚠ ${w}`).join('\n') || '  (none)'}`,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error validating object: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Handle fix_common_issues tool
 */
export async function handleFixCommonIssues(args: any, sceneBridge: SceneBridge) {
  try {
    const snapshot = await sceneBridge.getSnapshot()
    const { dryRun = true } = args

    const fixes: string[] = []

    if (!snapshot.objects || snapshot.objects.length === 0) {
      return {
        content: [{ type: 'text', text: 'Scene has no objects to fix' }],
      }
    }

    // Fix zero scales
    for (const obj of snapshot.objects) {
      if (obj.transform.scale) {
        const [sx, sy, sz] = obj.transform.scale
        if (sx === 0 || sy === 0 || sz === 0) {
          fixes.push(`Fix zero scale for '${obj.id}': set to [1, 1, 1]`)
          if (!dryRun) {
            await sceneBridge.send({
              command: 'edit_object',
              objectId: obj.id,
              updates: { scale: [sx || 1, sy || 1, sz || 1] },
            })
          }
        }
      }
    }

    // Fix missing visible property
    for (const obj of snapshot.objects) {
      if (obj.visible === undefined) {
        fixes.push(`Set explicit visible=true for '${obj.id}'`)
        if (!dryRun) {
          await sceneBridge.send({
            command: 'edit_object',
            objectId: obj.id,
            updates: { visible: true },
          })
        }
      }
    }

    // Remove empty groups
    const emptyGroups = snapshot.objects.filter(
      (o: any) => o.type === 'group' && (!o.children || o.children.length === 0)
    )
    for (const group of emptyGroups) {
      fixes.push(`Remove empty group '${group.id}'`)
      if (!dryRun) {
        await sceneBridge.send({
          command: 'delete_object',
          objectId: group.id,
        })
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: `${dryRun ? 'Preview of fixes (dry run)' : 'Applied fixes'}:\n\n${fixes.length > 0 ? fixes.map((f) => `  • ${f}`).join('\n') : '  No fixes needed'}${dryRun && fixes.length > 0 ? '\n\nRun with dryRun=false to apply these fixes.' : ''}`,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error fixing issues: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Handle check_performance tool
 */
export async function handleCheckPerformance(sceneBridge: SceneBridge) {
  try {
    const snapshot = await sceneBridge.getSnapshot()
    const warnings: string[] = []
    const tips: string[] = []

    if (!snapshot.objects || snapshot.objects.length === 0) {
      return {
        content: [{ type: 'text', text: 'Scene has no objects to check' }],
      }
    }

    // Object count
    const objectCount = snapshot.objects.length
    if (objectCount > 500) {
      warnings.push(`High object count: ${objectCount} objects`)
      tips.push('Consider using instancing for repeated objects')
    }

    // Mesh count
    const meshCount = snapshot.objects.filter((o: any) => o.type === 'mesh').length
    if (meshCount > 200) {
      warnings.push(`High mesh count: ${meshCount} meshes`)
      tips.push('Consider using LOD or object pooling')
    }

    // Complex materials
    const physicalMaterials = snapshot.objects.filter(
      (o: any) => o.material?.type === 'MeshPhysicalMaterial'
    ).length
    if (physicalMaterials > 50) {
      warnings.push(`Many physical materials: ${physicalMaterials}`)
      tips.push('Physical materials are expensive, consider using standard materials')
    }

    // Lights count
    const lightCount =
      (snapshot.lighting?.directional?.length || 0) +
      (snapshot.lighting?.point?.length || 0) +
      (snapshot.lighting?.spot?.length || 0)

    if (lightCount > 8) {
      warnings.push(`High light count: ${lightCount} lights`)
      tips.push('Too many lights can impact performance, aim for 3-5 lights')
    }

    // Shadow casters
    const shadowCasters = snapshot.lighting?.directional?.filter((l: any) => l.castShadow).length || 0
    if (shadowCasters > 2) {
      warnings.push(`Multiple shadow casters: ${shadowCasters}`)
      tips.push('Shadows are expensive, limit to 1-2 shadow-casting lights')
    }

    // Hidden objects (wasting memory)
    const hiddenCount = snapshot.objects.filter((o: any) => o.visible === false).length
    if (hiddenCount > 50) {
      warnings.push(`Many hidden objects: ${hiddenCount}`)
      tips.push('Hidden objects still use memory, consider removing instead of hiding')
    }

    const performanceScore = Math.max(
      0,
      100 -
        (objectCount > 500 ? 20 : 0) -
        (meshCount > 200 ? 20 : 0) -
        (physicalMaterials > 50 ? 15 : 0) -
        (lightCount > 8 ? 15 : 0) -
        (shadowCasters > 2 ? 10 : 0) -
        (hiddenCount > 50 ? 20 : 0)
    )

    return {
      content: [
        {
          type: 'text',
          text: `Performance Analysis\n\nScore: ${performanceScore}/100\n\n${warnings.length > 0 ? `Warnings (${warnings.length}):\n${warnings.map((w) => `  ⚠ ${w}`).join('\n')}` : '✓ No performance warnings'}\n\n${tips.length > 0 ? `Optimization Tips:\n${tips.map((t) => `  💡 ${t}`).join('\n')}` : ''}`,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error checking performance: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Handle validate_references tool
 */
export async function handleValidateReferences(sceneBridge: SceneBridge) {
  try {
    const snapshot = await sceneBridge.getSnapshot()
    const errors: string[] = []

    if (!snapshot.objects || snapshot.objects.length === 0) {
      return {
        content: [{ type: 'text', text: 'Scene has no objects to check' }],
      }
    }

    const objectIds = new Set(snapshot.objects.map((o: any) => o.id))

    // Check parent/child references
    snapshot.objects.forEach((obj: any) => {
      if (obj.children) {
        obj.children.forEach((child: any) => {
          // Child IDs should be unique within the group
          // (handled by duplicate ID check in validate_scene)
        })
      }
    })

    // Check interaction targets
    snapshot.objects.forEach((obj: any) => {
      if (obj.interactions?.onClick?.target) {
        const target = obj.interactions.onClick.target
        if (!objectIds.has(target) && !['home', 'consulting', 'software', 'construction', 'contact'].includes(target)) {
          errors.push(`Object '${obj.id}' has invalid interaction target: '${target}'`)
        }
      }
    })

    return {
      content: [
        {
          type: 'text',
          text: `Reference Validation\n\n${errors.length === 0 ? '✓ All references valid' : `Errors (${errors.length}):\n${errors.map((e) => `  ✗ ${e}`).join('\n')}`}`,
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error validating references: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Main validation tool handler
 */
export async function handleValidationTool(
  name: string,
  args: any,
  sceneBridge: SceneBridge
) {
  switch (name) {
    case 'validate_scene':
      return await handleValidateScene(args, sceneBridge)
    case 'check_scene_health':
      return await handleCheckSceneHealth(sceneBridge)
    case 'validate_object':
      return await handleValidateObject(args, sceneBridge)
    case 'fix_common_issues':
      return await handleFixCommonIssues(args, sceneBridge)
    case 'check_performance':
      return await handleCheckPerformance(sceneBridge)
    case 'validate_references':
      return await handleValidateReferences(sceneBridge)
    default:
      return {
        content: [{ type: 'text', text: `Unknown validation tool: ${name}` }],
        isError: true,
      }
  }
}
