declare const WHEN_BRAND: unique symbol

export interface WhenResult {
  readonly [WHEN_BRAND]: true
  readonly __isWhen: true
  readonly value: unknown
  readonly resolved: string | null
  readonly options?: WhenOptions
}

export interface WhenOptions<T = unknown> {
  /**
   * Additional condition for inclusion.
   * - Function: predicate receives the non-nullish value, include if returns true
   * - Any other type: treated as a boolean gate, include if truthy
   */
  test?: ((value: NonNullable<T>) => boolean) | unknown
  /** Prepended to value when included */
  prefix?: string
  /** Appended to value when included */
  suffix?: string
  /** Transform value before including */
  transform?: (value: NonNullable<T>) => string | number
}

export type StrifxInput =
  | string
  | number
  | WhenResult
  | false
  | null
  | undefined

export interface JoinListOptions {
  locale?: string | string[]
  type?: Intl.ListFormatType
  style?: Intl.ListFormatStyle
}

export type StrifxObject = Record<
  string,
  string | number | [condition: unknown, text: string] | null | undefined
>
