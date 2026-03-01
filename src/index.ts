import type {
  JoinListOptions,
  StrifxInput,
  StrifxObject,
  WhenResult,
} from './types.js'
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

// Overloads
function strifx(
  strings: TemplateStringsArray,
  ...values: (string | number | WhenResult)[]
): string
function strifx(input: StrifxObject): string
function strifx(
  stringsOrInput: TemplateStringsArray | StrifxObject,
  ...values: (string | number | WhenResult)[]
): string {
  // Object syntax
  if (
    !Array.isArray(stringsOrInput) &&
    typeof stringsOrInput === 'object' &&
    !('raw' in stringsOrInput)
  ) {
    const input = stringsOrInput as StrifxObject
    let result = ''
    for (const key of Object.keys(input)) {
      const val = input[key]
      if (val === null || val === undefined) continue
      if (Array.isArray(val)) {
        const [condition, text] = val
        if (condition) result += text
      } else {
        result += String(val)
      }
    }
    return result
  }

  // Tagged template
  const strings = stringsOrInput as TemplateStringsArray
  let raw = ''
  for (let i = 0; i < strings.length; i++) {
    raw += strings[i]
    if (i < values.length) {
      raw += resolveValue(values[i])
    }
  }

  return cleanWhitespace(raw)
}

function resolveParts(parts: StrifxInput[]): string[] {
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

// strifx.join
strifx.join = function join(
  separator?: string | JoinListOptions,
): (...parts: StrifxInput[]) => string {
  if (typeof separator === 'object' && separator !== null) {
    const { locale, ...opts } = separator
    const formatter = new Intl.ListFormat(locale, opts)
    return (...parts: StrifxInput[]): string => {
      return formatter.format(resolveParts(parts))
    }
  }
  const sep = separator ?? ' '
  return (...parts: StrifxInput[]): string => {
    return resolveParts(parts).join(sep)
  }
}

export type {
  JoinListOptions,
  StrifxInput,
  StrifxObject,
  WhenOptions,
  WhenResult,
} from './types.js'
export { isWhenResult } from './when.js'
export { strifx, when }
