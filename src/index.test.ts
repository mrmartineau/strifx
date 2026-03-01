import { describe, expect, it } from 'vitest'
import { strifx, when } from './index.js'

describe('strifx tagged template', () => {
  it('works with plain strings (no when)', () => {
    expect(strifx`Hello world`).toBe('Hello world')
  })

  it('works with regular interpolation', () => {
    const status = 'shipped'
    expect(strifx`Order #${1234} is ${status}`).toBe('Order #1234 is shipped')
  })

  it('includes when value is present', () => {
    const name = 'Zander'
    expect(strifx`Hello ${when(name)} world`).toBe('Hello Zander world')
  })

  it('excludes when value is undefined', () => {
    const name = undefined
    expect(strifx`Hello ${when(name)} world`).toBe('Hello world')
  })

  it('excludes when value is null', () => {
    const name = null
    expect(strifx`Hello ${when(name)} world`).toBe('Hello world')
  })

  it('includes 0 as valid value', () => {
    expect(strifx`Count: ${when(0)}`).toBe('Count: 0')
  })

  it('includes empty string as valid value', () => {
    expect(strifx`Value: ${when('')}end`).toBe('Value: end')
  })

  it('handles multiple conditionals', () => {
    const title = 'Dr'
    const name = 'Smith'
    const status = 'ready'
    expect(
      strifx`Dear${when(title, { prefix: ' ' })}${when(name, { prefix: ' ' })}, your order is ${status}.`,
    ).toBe('Dear Dr Smith, your order is ready.')
  })

  it('handles multiple conditionals with some missing', () => {
    const title = undefined
    const name = 'Smith'
    const status = 'ready'
    expect(
      strifx`Dear${when(title, { prefix: ' ' })}${when(name, { prefix: ' ' })}, your order is ${status}.`,
    ).toBe('Dear Smith, your order is ready.')
  })

  it('handles all conditionals missing', () => {
    const title = undefined
    const name = undefined
    const status = 'ready'
    expect(
      strifx`Dear${when(title, { prefix: ' ' })}${when(name, { prefix: ' ' })}, your order is ${status}.`,
    ).toBe('Dear, your order is ready.')
  })

  it('handles prefix and suffix', () => {
    const name = 'Zander'
    expect(strifx`Hello${when(name, { prefix: ' ', suffix: '!' })} world`).toBe(
      'Hello Zander! world',
    )
  })

  it('omits prefix/suffix when value missing', () => {
    const name = undefined
    expect(strifx`Hello${when(name, { prefix: ' ', suffix: '!' })} world`).toBe(
      'Hello world',
    )
  })

  describe('whitespace cleanup', () => {
    it('collapses multiple spaces', () => {
      const name = undefined
      expect(strifx`Hello ${when(name)} world`).toBe('Hello world')
    })

    it('trims lines', () => {
      expect(strifx`  Hello  `).toBe('Hello')
    })

    it('removes blank lines', () => {
      const optionalLine = undefined
      const result = strifx`Line 1
${when(optionalLine)}
Line 3`
      expect(result).toBe('Line 1\nLine 3')
    })

    it('keeps content lines in multi-line', () => {
      const optionalLine = 'Line 2'
      const result = strifx`Line 1
${when(optionalLine)}
Line 3`
      expect(result).toBe('Line 1\nLine 2\nLine 3')
    })
  })
})

describe('strifx.join', () => {
  it('joins with comma separator', () => {
    expect(strifx.join(', ')('apples', 'bananas', 'cherries')).toBe(
      'apples, bananas, cherries',
    )
  })

  it('filters nullish from join', () => {
    const bananas = undefined
    expect(strifx.join(', ')('apples', when(bananas), 'cherries')).toBe(
      'apples, cherries',
    )
  })

  it('uses space as default separator', () => {
    expect(strifx.join()('Hello', 'world')).toBe('Hello world')
  })

  it('handles when with transform in join', () => {
    const unit = '4B'
    expect(
      strifx.join('\n')(
        '123 Main St',
        when(unit, { transform: (v: string) => `Unit ${v}` }),
        'New York, NY 10001',
      ),
    ).toBe('123 Main St\nUnit 4B\nNew York, NY 10001')
  })

  it('handles when with test in join', () => {
    const country = 'US'
    expect(
      strifx.join('\n')(
        '123 Main St',
        'New York, NY 10001',
        when(country, { test: (v: string) => v !== 'US' }),
      ),
    ).toBe('123 Main St\nNew York, NY 10001')
  })

  it('includes 0 in join', () => {
    expect(strifx.join(', ')(0, 1, 2)).toBe('0, 1, 2')
  })

  it('includes empty string in join', () => {
    expect(strifx.join(', ')('a', '', 'c')).toBe('a, , c')
  })

  it('filters false from join', () => {
    expect(strifx.join(', ')('a', false, 'c')).toBe('a, c')
  })

  it('filters null from join', () => {
    expect(strifx.join(', ')('a', null, 'c')).toBe('a, c')
  })

  it('joins with Intl.ListFormat conjunction', () => {
    expect(
      strifx.join({ locale: 'en', type: 'conjunction' })(
        'apples',
        'bananas',
        'cherries',
      ),
    ).toBe('apples, bananas, and cherries')
  })

  it('joins with Intl.ListFormat disjunction', () => {
    expect(
      strifx.join({ locale: 'en', type: 'disjunction' })(
        'apples',
        'bananas',
        'cherries',
      ),
    ).toBe('apples, bananas, or cherries')
  })

  it('filters nullish with Intl.ListFormat', () => {
    const bananas = undefined
    expect(
      strifx.join({ locale: 'en', type: 'conjunction' })(
        'apples',
        when(bananas),
        'cherries',
      ),
    ).toBe('apples and cherries')
  })

  it('joins with Intl.ListFormat narrow style', () => {
    expect(
      strifx.join({ locale: 'en', style: 'narrow', type: 'conjunction' })(
        'apples',
        'bananas',
        'cherries',
      ),
    ).toBe('apples, bananas, cherries')
  })

  it('SQL-style join', () => {
    const minAge = 21
    const maxAge = undefined
    const region = 'EU'
    expect(
      strifx.join(' AND ')(
        `status = 'active'`,
        when(minAge, { transform: (v: number) => `age >= ${v}` }),
        when(maxAge, { transform: (v) => `age <= ${v}` }),
        when(region, { transform: (v: string) => `region = '${v}'` }),
      ),
    ).toBe("status = 'active' AND age >= 21 AND region = 'EU'")
  })
})

describe('strifx object syntax', () => {
  it('concatenates all truthy values', () => {
    expect(
      // biome-ignore assist/source/useSortedKeys: false positive
      strifx({
        base: 'Dear ',
        name: 'Zander',
        closing: '\nBest regards',
      }),
    ).toBe('Dear Zander\nBest regards')
  })

  it('skips null and undefined values', () => {
    expect(
      // biome-ignore assist/source/useSortedKeys: false positive
      strifx({
        base: 'Dear ',
        name: null,
        closing: '\nBest regards',
      }),
    ).toBe('Dear \nBest regards')
  })

  it('handles tuple conditional — truthy', () => {
    expect(
      // biome-ignore assist/source/useSortedKeys: false positive
      strifx({
        base: 'Dear ',
        name: 'Zander',
        greeting: [true, ', welcome!'],
        closing: '\nBest regards',
      }),
    ).toBe('Dear Zander, welcome!\nBest regards')
  })

  it('handles tuple conditional — falsy', () => {
    expect(
      // biome-ignore assist/source/useSortedKeys: false positive
      strifx({
        base: 'Dear ',
        name: 'Zander',
        greeting: [false, ', welcome!'],
        closing: '\nBest regards',
      }),
    ).toBe('Dear Zander\nBest regards')
  })

  it('includes 0 as value', () => {
    expect(
      // biome-ignore assist/source/useSortedKeys: false positive
      strifx({
        label: 'Count: ',
        count: 0,
      }),
    ).toBe('Count: 0')
  })
})
