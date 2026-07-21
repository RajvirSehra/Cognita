/**
 * Thin, defensive wrapper around window.localStorage.
 *
 * Every read is tolerant of missing keys, invalid JSON, and data that no
 * longer matches the expected shape — it falls back to a safe default
 * rather than throwing, so a corrupted or tampered-with browser storage
 * can never crash the app.
 *
 * Writes can legitimately fail (storage disabled, private-browsing quota,
 * quota exceeded) and throw a StorageError so callers can surface a
 * message instead of silently losing data.
 */

export class StorageError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message)
    this.name = 'StorageError'
  }
}

function getStorage(): Storage | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null
    const testKey = '__cognita_storage_test__'
    window.localStorage.setItem(testKey, '1')
    window.localStorage.removeItem(testKey)
    return window.localStorage
  } catch {
    return null
  }
}

export function isStorageAvailable(): boolean {
  return getStorage() !== null
}

/**
 * Reads and parses JSON from localStorage. Returns `fallback` if the key is
 * missing, the JSON is malformed, or `isValid` rejects the parsed value.
 */
export function readJSON<T>(key: string, fallback: T, isValid?: (value: unknown) => value is T): T {
  const storage = getStorage()
  if (!storage) return fallback

  const raw = storage.getItem(key)
  if (raw === null) return fallback

  try {
    const parsed = JSON.parse(raw)
    if (isValid && !isValid(parsed)) {
      console.warn(`[cognita] Ignoring corrupted data at "${key}" — failed validation.`)
      return fallback
    }
    return parsed as T
  } catch (error) {
    console.warn(`[cognita] Ignoring corrupted data at "${key}" — invalid JSON.`, error)
    return fallback
  }
}

/** Writes JSON to localStorage. Throws StorageError if the write fails. */
export function writeJSON<T>(key: string, value: T): void {
  const storage = getStorage()
  if (!storage) {
    throw new StorageError('Local storage is not available in this browser.')
  }
  try {
    storage.setItem(key, JSON.stringify(value))
  } catch (error) {
    const isQuotaError =
      error instanceof DOMException &&
      (error.code === 22 || error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    throw new StorageError(
      isQuotaError
        ? 'Storage is full. Export a backup and remove old data to free up space.'
        : 'Could not save data to local storage.',
      error,
    )
  }
}

export function removeItem(key: string): void {
  const storage = getStorage()
  if (!storage) return
  try {
    storage.removeItem(key)
  } catch {
    // Ignore — nothing meaningful to recover from a failed removal.
  }
}
