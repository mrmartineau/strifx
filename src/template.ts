import { strifx } from './index.js'
import type { WhenOptions, WhenResult } from './types.js'
import { isWhenResult, when } from './when.js'

type TemplateValue = string | WhenResult

// Tagged template style
function template(
  strings: TemplateStringsArray,
  ...descriptors: TemplateValue[]
): (values: Record<string, unknown>) => string

// Function style
function template<K extends string>(config: {
  keys: readonly K[]
  render: (values: Record<K, unknown>) => string
}): (values: Record<K, unknown>) => string

function template(
  stringsOrConfig:
    | TemplateStringsArray
    | {
        keys: readonly string[]
        render: (values: Record<string, unknown>) => string
      },
  ...descriptors: TemplateValue[]
): (values: Record<string, unknown>) => string {
  // Function style
  if (!Array.isArray(stringsOrConfig) && 'render' in stringsOrConfig) {
    return stringsOrConfig.render
  }

  // Tagged template style
  const strings = stringsOrConfig as TemplateStringsArray

  return (values: Record<string, unknown>): string => {
    const resolvedValues: (string | number | WhenResult)[] = descriptors.map(
      (desc) => {
        if (isWhenResult(desc)) {
          // It's a when() with a key name — look up the actual value and re-run when
          const key = String(desc.value)
          const actualValue = values[key]
          return when(actualValue, desc.options as WhenOptions)
        }
        // Plain string key — look up and return as string
        const key = desc as string
        const val = values[key]
        return val == null ? '' : String(val)
      },
    )

    // Use strifx tagged template with the original strings and resolved values
    return strifx(strings, ...resolvedValues)
  }
}

export { strifx } from './index.js'
export { when } from './when.js'
export { template }
