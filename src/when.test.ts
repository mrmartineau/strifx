import { describe, expect, it } from 'vitest'
import { isWhenResult, when } from './when.js'

describe('when', () => {
  describe('nullish policy', () => {
    it('includes non-nullish strings', () => {
      expect(when('hello').resolved).toBe('hello')
    })

    it('includes 0 (not nullish)', () => {
      expect(when(0).resolved).toBe('0')
    })

    it('includes empty string (not nullish)', () => {
      expect(when('').resolved).toBe('')
    })

    it('skips null', () => {
      expect(when(null).resolved).toBeNull()
    })

    it('skips undefined', () => {
      expect(when(undefined).resolved).toBeNull()
    })

    it('skips false', () => {
      expect(when(false).resolved).toBeNull()
    })

    it('includes true', () => {
      expect(when(true).resolved).toBe('true')
    })

    it('includes NaN', () => {
      expect(when(NaN).resolved).toBe('NaN')
    })
  })

  describe('test option — function predicate', () => {
    it('includes when predicate returns true', () => {
      expect(when(5, { test: (v: number) => v > 0 }).resolved).toBe('5')
    })

    it('skips when predicate returns false', () => {
      expect(when(-1, { test: (v: number) => v > 0 }).resolved).toBeNull()
    })

    it('skips 0 when predicate returns false', () => {
      expect(when(0, { test: (v: number) => v > 0 }).resolved).toBeNull()
    })

    it('never calls predicate for nullish values', () => {
      let called = false
      when(null, {
        test: () => {
          called = true
          return true
        },
      })
      expect(called).toBe(false)
    })

    it('never calls predicate for undefined', () => {
      let called = false
      when(undefined, {
        test: () => {
          called = true
          return true
        },
      })
      expect(called).toBe(false)
    })
  })

  describe('test option — boolean gate', () => {
    it('includes when gate is truthy', () => {
      expect(when('Zander', { test: true }).resolved).toBe('Zander')
    })

    it('skips when gate is falsy', () => {
      expect(when('Zander', { test: false }).resolved).toBeNull()
    })

    it('skips when gate is 0', () => {
      expect(when('Zander', { test: 0 }).resolved).toBeNull()
    })

    it('includes when gate is 1', () => {
      expect(when('Zander', { test: 1 }).resolved).toBe('Zander')
    })

    it('skips when gate is empty string', () => {
      expect(when('Zander', { test: '' }).resolved).toBeNull()
    })

    it('nullish value still skipped even with truthy gate', () => {
      expect(when(undefined, { test: true }).resolved).toBeNull()
    })
  })

  describe('prefix and suffix', () => {
    it('applies prefix when included', () => {
      expect(when('world', { prefix: ', ' }).resolved).toBe(', world')
    })

    it('applies suffix when included', () => {
      expect(when('hello', { suffix: '!' }).resolved).toBe('hello!')
    })

    it('applies both prefix and suffix', () => {
      expect(when('name', { prefix: ' ', suffix: ',' }).resolved).toBe(' name,')
    })

    it('omits prefix when skipped', () => {
      expect(when(undefined, { prefix: ', ' }).resolved).toBeNull()
    })

    it('omits suffix when skipped', () => {
      expect(when(undefined, { suffix: '!' }).resolved).toBeNull()
    })
  })

  describe('transform', () => {
    it('transforms value before including', () => {
      expect(
        when('hello', { transform: (v: string) => v.toUpperCase() }).resolved,
      ).toBe('HELLO')
    })

    it('skips transform for nullish', () => {
      expect(
        when(undefined, { transform: (v: string) => v.toUpperCase() }).resolved,
      ).toBeNull()
    })

    it('combines transform with prefix/suffix', () => {
      expect(
        when('  Zander  ', {
          prefix: ' ',
          suffix: ',',
          transform: (v: string) => v.trim(),
        }).resolved,
      ).toBe(' Zander,')
    })
  })

  describe('combined options', () => {
    it('test + prefix + suffix + transform', () => {
      const result = when('  Zander  ', {
        prefix: ' ',
        suffix: ',',
        test: true,
        transform: (v: string) => v.trim(),
      })
      expect(result.resolved).toBe(' Zander,')
    })

    it('test fails — everything skipped', () => {
      const result = when('  Zander  ', {
        prefix: ' ',
        suffix: ',',
        test: false,
        transform: (v: string) => v.trim(),
      })
      expect(result.resolved).toBeNull()
    })

    it('nullish + truthy test — still skipped', () => {
      const result = when(undefined, {
        prefix: ' ',
        suffix: ',',
        test: true,
        transform: (v: string) => v,
      })
      expect(result.resolved).toBeNull()
    })
  })

  describe('isWhenResult', () => {
    it('identifies WhenResult objects', () => {
      expect(isWhenResult(when('hello'))).toBe(true)
      expect(isWhenResult(when(null))).toBe(true)
    })

    it('rejects non-WhenResult values', () => {
      expect(isWhenResult('hello')).toBe(false)
      expect(isWhenResult(42)).toBe(false)
      expect(isWhenResult(null)).toBe(false)
      expect(isWhenResult(undefined)).toBe(false)
      expect(isWhenResult({})).toBe(false)
    })
  })
})
