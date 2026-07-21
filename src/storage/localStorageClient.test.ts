import { beforeEach, describe, expect, it, vi } from 'vitest'
import { isStorageAvailable, readJSON, removeItem, StorageError, writeJSON } from '@/storage/localStorageClient'

const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string')

describe('localStorageClient', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('reports storage as available in jsdom', () => {
    expect(isStorageAvailable()).toBe(true)
  })

  it('returns the fallback when the key is missing', () => {
    expect(readJSON('missing-key', ['default'], isStringArray)).toEqual(['default'])
  })

  it('round-trips valid data', () => {
    writeJSON('key', ['a', 'b'])
    expect(readJSON('key', [], isStringArray)).toEqual(['a', 'b'])
  })

  it('falls back safely on invalid JSON instead of throwing', () => {
    window.localStorage.setItem('corrupted', '{not valid json')
    expect(() => readJSON('corrupted', ['fallback'], isStringArray)).not.toThrow()
    expect(readJSON('corrupted', ['fallback'], isStringArray)).toEqual(['fallback'])
  })

  it('falls back safely when parsed data fails the validator', () => {
    window.localStorage.setItem('wrong-shape', JSON.stringify({ not: 'an array of strings' }))
    expect(readJSON('wrong-shape', ['fallback'], isStringArray)).toEqual(['fallback'])
  })

  it('removes items without throwing even if the key never existed', () => {
    expect(() => removeItem('never-existed')).not.toThrow()
  })

  it('throws a StorageError when the underlying write fails', () => {
    const setItemSpy = vi.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })

    expect(() => writeJSON('key', ['x'])).toThrow(StorageError)

    setItemSpy.mockRestore()
  })
})
