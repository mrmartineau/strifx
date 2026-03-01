import { describe, expect, it } from 'vitest'
import { strifx } from './index.js'
import { template } from './template.js'
import { when } from './when.js'

describe('template — tagged template style', () => {
  it('resolves plain key placeholders', () => {
    const greet = template`Hello ${'name'}!`
    expect(greet({ name: 'Zander' })).toBe('Hello Zander!')
  })

  it('resolves when() key placeholders', () => {
    const greet = template`Hello${when('title', { prefix: ' ' })}${when('name', { prefix: ' ' })}!`
    expect(greet({ name: 'Smith', title: 'Dr' })).toBe('Hello Dr Smith!')
  })

  it('skips when() for missing keys', () => {
    const greet = template`Hello${when('title', { prefix: ' ' })}${when('name', { prefix: ' ' })}!`
    expect(greet({ name: 'Smith' })).toBe('Hello Smith!')
  })

  it('handles all keys missing for when()', () => {
    const greet = template`Hello${when('title', { prefix: ' ' })}!`
    expect(greet({})).toBe('Hello!')
  })

  it('handles transform in template when()', () => {
    const addr = template`${'street'}${when('unit', { prefix: ', Unit ' })}`
    expect(addr({ street: '123 Main', unit: '4B' })).toBe('123 Main, Unit 4B')
    expect(addr({ street: '123 Main' })).toBe('123 Main')
  })

  it('handles test function in template when()', () => {
    const addr = template`${'city'}${when('country', { prefix: '\n', test: (v: string) => v !== 'US' })}`
    expect(addr({ city: 'NYC', country: 'US' })).toBe('NYC')
    expect(addr({ city: 'London', country: 'UK' })).toBe('London\nUK')
  })

  it('is reusable', () => {
    const t = template`${'a'} + ${'b'}`
    expect(t({ a: '1', b: '2' })).toBe('1 + 2')
    expect(t({ a: 'x', b: 'y' })).toBe('x + y')
  })
})

describe('template — function style', () => {
  it('wraps render function', () => {
    const greeting = template({
      keys: ['name', 'title'] as const,
      render: (v) =>
        strifx`Dear${when(v.title, { prefix: ' ' })}${when(v.name, { prefix: ' ' })}.`,
    })

    expect(greeting({ name: 'Zander', title: 'Dr' })).toBe('Dear Dr Zander.')
    expect(greeting({ name: 'Zander', title: undefined })).toBe('Dear Zander.')
  })
})
