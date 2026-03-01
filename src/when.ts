import type { WhenOptions, WhenResult } from './types.js'

export function isWhenResult(value: unknown): value is WhenResult {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { __isWhen?: unknown }).__isWhen === true
  )
}

export function when<T>(value: T, options?: WhenOptions<T>): WhenResult {
  // Nullish always skipped
  if (value === null || value === undefined) {
    return { __isWhen: true, options, resolved: null, value } as WhenResult
  }

  // false always skipped
  if (value === false) {
    return { __isWhen: true, options, resolved: null, value } as WhenResult
  }

  // Check test condition
  if (options?.test !== undefined) {
    if (typeof options.test === 'function') {
      if (
        !(options.test as (v: NonNullable<T>) => boolean)(
          value as NonNullable<T>,
        )
      ) {
        return { __isWhen: true, options, resolved: null, value } as WhenResult
      }
    } else {
      // Boolean gate — check truthiness
      if (!options.test) {
        return { __isWhen: true, options, resolved: null, value } as WhenResult
      }
    }
  }

  // Transform
  let result: string
  if (options?.transform) {
    result = String(options.transform(value as NonNullable<T>))
  } else {
    result = String(value)
  }

  // Apply prefix/suffix
  const prefix = options?.prefix ?? ''
  const suffix = options?.suffix ?? ''
  const resolved = `${prefix}${result}${suffix}`

  return { __isWhen: true, options, resolved, value } as WhenResult
}
