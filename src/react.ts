import { createElement, Fragment, type ReactNode, useMemo } from 'react'
import type { JoinListOptions, WhenResult } from './types.js'
import { isWhenResult, when } from './when.js'

function cleanWhitespace(raw: string): string {
  return raw
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .filter((line) => line !== '')
    .join('\n')
}

function resolveValue(val: unknown): string {
  if (isWhenResult(val)) {
    return (val as WhenResult).resolved ?? ''
  }
  if (val === null || val === undefined || val === false) {
    return ''
  }
  return String(val)
}

/**
 * useStrifx — tagged template hook returning a memoised string.
 * Usage: const title = useStrifx`Dear${when(name, { prefix: ' ' })}`;
 */
function useStrifx(
  strings: TemplateStringsArray,
  ...values: (string | number | WhenResult)[]
): string {
  return useMemo(() => {
    let raw = ''
    for (let i = 0; i < strings.length; i++) {
      raw += strings[i]
      if (i < values.length) {
        raw += resolveValue(values[i])
      }
    }
    return cleanWhitespace(raw)
  }, [
    strings,
    ...values.map((v) => (isWhenResult(v) ? (v as WhenResult).resolved : v)),
    values,
    values.length,
  ])
}

/**
 * useStrifx.join — hook version of strifx.join returning a memoised string.
 * Usage: const label = useStrifx.join(' · ')(name, when(role), when(team));
 */
useStrifx.join = function joinHook(separator?: string | JoinListOptions) {
  const resolveParts = (
    parts: (string | number | WhenResult | false | null | undefined)[],
  ): string[] => {
    const resolved: string[] = []
    for (const part of parts) {
      if (isWhenResult(part)) {
        const r = (part as WhenResult).resolved
        if (r !== null) resolved.push(r)
      } else if (part === null || part === undefined || part === false) {
        // skip
      } else {
        resolved.push(String(part))
      }
    }
    return resolved
  }

  if (typeof separator === 'object' && separator !== null) {
    const { locale, ...opts } = separator
    const formatter = new Intl.ListFormat(locale, opts)
    return (
      ...parts: (string | number | WhenResult | false | null | undefined)[]
    ): string => {
      return formatter.format(resolveParts(parts))
    }
  }
  const sep = separator ?? ' '
  return (
    ...parts: (string | number | WhenResult | false | null | undefined)[]
  ): string => {
    return resolveParts(parts).join(sep)
  }
}

/**
 * Resolve a WhenResult for React context.
 * If the transform produced a non-string ReactNode (JSX element, etc.),
 * we re-invoke the transform to get the actual ReactNode rather than using
 * the stringified `resolved` field.
 */
function resolveWhenForReact(w: WhenResult): ReactNode {
  if (w.resolved === null) return null
  if (w.options?.transform && w.value !== null && w.value !== undefined) {
    return w.options.transform(w.value as never)
  }
  return w.resolved
}

/**
 * strifxReact — conditional ReactNode[] output with separators.
 * Usage: const parts = strifxReact(' · ')(when(user, { transform: u => <strong>{u.name}</strong> }), ...);
 */
function strifxReact(separator?: ReactNode) {
  return (...parts: (ReactNode | WhenResult)[]): ReactNode[] => {
    const included: ReactNode[] = []

    for (const part of parts) {
      if (isWhenResult(part)) {
        const node = resolveWhenForReact(part as WhenResult)
        if (node !== null) {
          included.push(node)
        }
      } else if (part === null || part === undefined || part === false) {
        // skip
      } else {
        included.push(part)
      }
    }

    if (separator === undefined || included.length <= 1) {
      return included
    }

    const result: ReactNode[] = []
    for (let i = 0; i < included.length; i++) {
      if (i > 0) {
        result.push(createElement(Fragment, { key: `sep-${i}` }, separator))
      }
      result.push(createElement(Fragment, { key: `item-${i}` }, included[i]))
    }
    return result
  }
}

export type { JoinListOptions, WhenOptions, WhenResult } from './types.js'
export { isWhenResult } from './when.js'
export { strifxReact, useStrifx, when }

const strifx = Object.assign(useStrifx, {
  join: useStrifx.join,
  react: strifxReact,
})

export { strifx }
