/**
 * Safe File Writing Utilities
 *
 * Provides atomic file writes with automatic backups to prevent data corruption.
 */

import * as fs from 'fs/promises'
import * as path from 'path'

export interface FileWriteOptions {
  /** Create backup before writing */
  createBackup?: boolean
  /** Custom backup directory (defaults to same directory with .backup suffix) */
  backupDir?: string
  /** Validate content before writing */
  validate?: (content: string) => boolean
}

export interface FileWriteResult {
  success: boolean
  message?: string
  error?: string
  path?: string
  backupPath?: string
}

/**
 * Write file atomically with optional backup
 *
 * Uses temp file + rename for atomicity
 */
export async function writeFileAtomic(
  filePath: string,
  content: string,
  options: FileWriteOptions = {}
): Promise<FileWriteResult> {
  const { createBackup = true, backupDir, validate } = options

  try {
    // Validate content if validator provided
    if (validate && !validate(content)) {
      return {
        success: false,
        error: 'Content validation failed',
      }
    }

    // Ensure directory exists
    const dir = path.dirname(filePath)
    await fs.mkdir(dir, { recursive: true })

    // Create backup if file exists
    let backupPath: string | undefined
    try {
      await fs.access(filePath)
      if (createBackup) {
        backupPath = await createBackupFile(filePath, backupDir)
      }
    } catch {
      // File doesn't exist yet, no backup needed
    }

    // Write to temp file first
    const tempPath = `${filePath}.tmp`
    await fs.writeFile(tempPath, content, 'utf-8')

    // Atomic rename
    await fs.rename(tempPath, filePath)

    return {
      success: true,
      message: `File written successfully: ${filePath}`,
      path: filePath,
      backupPath,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Create a timestamped backup of a file
 */
async function createBackupFile(
  filePath: string,
  backupDir?: string
): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const basename = path.basename(filePath)
  const dir = backupDir || path.dirname(filePath)

  const backupPath = path.join(dir, `${basename}.${timestamp}.backup`)

  await fs.copyFile(filePath, backupPath)
  return backupPath
}

/**
 * List all backups for a file
 */
export async function listBackups(
  filePath: string,
  backupDir?: string
): Promise<string[]> {
  const basename = path.basename(filePath)
  const dir = backupDir || path.dirname(filePath)

  try {
    const files = await fs.readdir(dir)
    return files
      .filter((f: string) => f.startsWith(basename) && f.endsWith('.backup'))
      .map((f: string) => path.join(dir, f))
      .sort()
      .reverse() // Most recent first
  } catch {
    return []
  }
}

/**
 * Restore from a backup file
 */
export async function restoreFromBackup(
  backupPath: string,
  targetPath: string
): Promise<FileWriteResult> {
  try {
    await fs.copyFile(backupPath, targetPath)
    return {
      success: true,
      message: `Restored from backup: ${backupPath}`,
      path: targetPath,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Clean old backups, keeping only the most recent N
 */
export async function cleanOldBackups(
  filePath: string,
  keepCount: number = 10,
  backupDir?: string
): Promise<number> {
  const backups = await listBackups(filePath, backupDir)

  if (backups.length <= keepCount) {
    return 0
  }

  const toDelete = backups.slice(keepCount)
  let deleted = 0

  for (const backup of toDelete) {
    try {
      await fs.unlink(backup)
      deleted++
    } catch {
      // Ignore errors
    }
  }

  return deleted
}

/**
 * Validate JSON content
 */
export function validateJSON(content: string): boolean {
  try {
    JSON.parse(content)
    return true
  } catch {
    return false
  }
}

/**
 * Validate scene JSON content
 */
export function validateSceneJSON(content: string): boolean {
  try {
    const data = JSON.parse(content)

    // Basic scene structure validation
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof data.id === 'string' &&
      typeof data.name === 'string' &&
      typeof data.version === 'string' &&
      Array.isArray(data.objects)
    )
  } catch {
    return false
  }
}
