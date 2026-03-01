import { renderHook } from '@testing-library/react'
import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { strifxReact, useStrifx, when } from './react.js'

describe('useStrifx', () => {
  it('returns plain string', () => {
    const { result } = renderHook(() => useStrifx`Hello world`)
    expect(result.current).toBe('Hello world')
  })

  it('includes when value is present', () => {
    const name = 'Zander'
    const { result } = renderHook(() => useStrifx`Hello ${when(name)} world`)
    expect(result.current).toBe('Hello Zander world')
  })

  it('excludes when value is undefined', () => {
    const name = undefined
    const { result } = renderHook(() => useStrifx`Hello ${when(name)} world`)
    expect(result.current).toBe('Hello world')
  })

  it('handles prefix/suffix', () => {
    const title = 'Dr'
    const name = 'Smith'
    const { result } = renderHook(
      () =>
        useStrifx`Dear${when(title, { prefix: ' ' })}${when(name, { prefix: ' ' })} — welcome`,
    )
    expect(result.current).toBe('Dear Dr Smith — welcome')
  })

  it('handles missing conditionals with prefix', () => {
    const title = undefined
    const name = 'Smith'
    const { result } = renderHook(
      () =>
        useStrifx`Dear${when(title, { prefix: ' ' })}${when(name, { prefix: ' ' })} — welcome`,
    )
    expect(result.current).toBe('Dear Smith — welcome')
  })
})

describe('strifxReact', () => {
  it('returns array of included parts', () => {
    const parts = strifxReact(' · ')('Alice', 'Bob', 'Charlie')
    // 3 items + 2 separators = 5 elements
    expect(parts).toHaveLength(5)
  })

  it('filters nullish WhenResult parts', () => {
    const parts = strifxReact(' · ')('Alice', when(undefined), 'Charlie')
    // 2 items + 1 separator = 3 elements
    expect(parts).toHaveLength(3)
  })

  it('returns single item without separator', () => {
    const parts = strifxReact(' · ')('Alice')
    expect(parts).toHaveLength(1)
  })

  it('handles transform producing ReactNode', () => {
    const user = { name: 'Zander' }
    const parts = strifxReact()(
      when(user, {
        transform: ((u: { name: string }) =>
          createElement('strong', null, u.name)) as unknown as (value: {
          name: string
        }) => string | number,
      }),
    )
    expect(parts).toHaveLength(1)
  })

  it('filters false values', () => {
    const parts = strifxReact(' · ')('Alice', false, 'Charlie')
    expect(parts).toHaveLength(3) // 2 items + 1 sep
  })

  it('returns empty array when all filtered', () => {
    const parts = strifxReact(' · ')(when(null), when(undefined), false)
    expect(parts).toHaveLength(0)
  })
})
