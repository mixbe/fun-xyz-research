import type {
  FormDescriptor,
  FormField,
  JsonValue,
} from '@fun-xyz/fiat-contract/types'

import type { SubmitTransition } from '~/domains/fiat/selectTransitions'

/**
 * A form's answers as a screen edits them, keyed by field id. Serialised into
 * the `FORM_VALUES` payload's entry list when the body is assembled.
 */
export type FormValues = Record<string, JsonValue>

/**
 * What local validation can say.
 *
 * Each names one fixable thing, because the server will not: it answers a
 * malformed answer with `INVALID_VALUE` on the whole submission and marks no
 * field, so a form checked only by the server can report nothing more useful
 * than "something is wrong".
 */
export type FormFieldIssue =
  | 'REQUIRED'
  | 'PATTERN'
  | 'COUNTRY_CODE'
  | 'DATE_FORMAT'
  | 'DATE_FUTURE'

/**
 * The input a form's values ride in, read off the transition rather than
 * assumed: the name is the server's (`values` in the recorded response) and
 * the `FORM_VALUES` spec is what marks it.
 */
export function formValuesInput(
  transition: SubmitTransition,
): string | undefined {
  const entries = Object.entries(transition.inputs ?? {})
  return entries.find(([, spec]) => spec.type === 'FORM_VALUES')?.[0]
}

/**
 * Whether the field is answered by a value the form submits.
 *
 * `HOSTED_LINK` is an errand the user runs elsewhere and `FILE` streams to the
 * document endpoint, so neither has a value to carry.
 */
export function isValueField(field: FormField): boolean {
  return field.type !== 'HOSTED_LINK' && field.type !== 'FILE'
}

/**
 * Whether the form requires a field nothing here can answer.
 *
 * Neither type carries a value, so {@link validateForm} has nothing to check
 * and would call the form complete:
 *
 * - `FILE` streams to `POST /fiat/kyc/document`, an upload path this build has
 *   not installed.
 * - `HOSTED_LINK` is an errand run elsewhere, and nothing reports back that the
 *   user ran it.
 *
 * Submitting either way sends a form the server will reject, re-entering
 * `INPUT_REQUIRED` with the same fields and nothing marked wrong.
 */
export function requiresUnanswerableField(form: FormDescriptor): boolean {
  return form.fields.some(
    (field) =>
      field.required && (field.type === 'FILE' || field.type === 'HOSTED_LINK'),
  )
}

/** Per-field issues, keyed by field id. Empty means nothing local to fix. */
export function validateForm(
  form: FormDescriptor,
  values: FormValues,
): Record<string, FormFieldIssue> {
  const issues: Record<string, FormFieldIssue> = {}
  for (const field of form.fields) {
    const issue = fieldIssue(field, values[field.id])
    if (issue !== undefined) {
      issues[field.id] = issue
    }
  }
  return issues
}

/** Whether the form is worth sending. */
export function canSubmitForm(
  form: FormDescriptor,
  values: FormValues,
): boolean {
  return (
    !requiresUnanswerableField(form) &&
    Object.keys(validateForm(form, values)).length === 0
  )
}

function fieldIssue(
  field: FormField,
  value: JsonValue | undefined,
): FormFieldIssue | undefined {
  if (!isValueField(field)) {
    return undefined
  }
  // A value that is not a string is reported, not coerced: the payload sends
  // whatever was collected, so coercing to `''` would skip every check below
  // and post the original anyway.
  if (value !== undefined && typeof value !== 'string') {
    return 'PATTERN'
  }
  const answer = value ?? ''
  // Whitespace is not an answer, but it is what gets sent, so the pattern
  // sees the string as typed. Trimming only here would pass `" Ada "` against
  // `^Ada$` locally and post the spaces anyway.
  if (answer.trim() === '') {
    return field.required ? 'REQUIRED' : undefined
  }
  return shapeIssue(field, answer) ?? patternIssue(field, answer)
}

/**
 * The shape a typed field's answer has to have on the wire.
 *
 * Checked here because the server declares no `regex` for these and refuses a
 * wrong shape without naming the field — `"Australia"` and `10/12/1990` are
 * both rejected, and the response says only that the submission was invalid.
 * Unchecked, the user is walked past the offending page and told two screens
 * later that something, somewhere, needs another look.
 */
function shapeIssue(
  field: FormField,
  answer: string,
): FormFieldIssue | undefined {
  if (field.type === 'COUNTRY') {
    return ISO_COUNTRY_CODE.test(answer) ? undefined : 'COUNTRY_CODE'
  }
  if (field.type === 'DATE') {
    if (!isCalendarDate(answer)) {
      return 'DATE_FORMAT'
    }
    // A KYC date that has not happened yet is never right, and the provider
    // answers one with an empty 400 that reaches the user as an SDK failure.
    return isFutureDate(answer) ? 'DATE_FUTURE' : undefined
  }
  return undefined
}

/** Compared as a UTC day, so a local clock behind UTC cannot fail today. */
function isFutureDate(answer: string): boolean {
  const now = new Date()
  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  )
  return Date.parse(`${answer}T00:00:00Z`) > today
}

const ISO_COUNTRY_CODE = /^[A-Za-z]{2}$/

/**
 * An ISO date the calendar actually has. The round trip is what rejects
 * `2026-02-30`: `Date` rolls it forward rather than refusing it.
 */
function isCalendarDate(answer: string): boolean {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(answer)
  if (parts === null) {
    return false
  }
  const [, year, month, day] = parts
  const parsed = new Date(`${answer}T00:00:00Z`)
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.getUTCFullYear() === Number(year) &&
    parsed.getUTCMonth() + 1 === Number(month) &&
    parsed.getUTCDate() === Number(day)
  )
}

function patternIssue(
  field: FormField,
  answer: string,
): FormFieldIssue | undefined {
  // The contract carries `regex` on TEXT alone; no other kind is patterned.
  const pattern = field.type === 'TEXT' ? field.regex : undefined
  return matchesPattern(pattern, answer) ? undefined : 'PATTERN'
}

/**
 * The longest answer a pattern is run against.
 *
 * No KYC field the design draws is near this long, and an answer past it is
 * left to the server.
 */
const PATTERN_INPUT_LIMIT = 512

/**
 * Whether a pattern quantifies a group that already quantifies or alternates
 * — `(a+)+`, `(a*)*`, `(a|aa)+` — which is the shape that backtracks
 * exponentially.
 *
 * A linear scan, not a regex: matching this shape with a regex is itself a
 * polynomial-time one over a string the server controls (CodeQL
 * `js/polynomial-redos`, which is exactly the trap being guarded against).
 */
function backtracks(pattern: string): boolean {
  // One entry per open group: whether its body holds a quantifier or an `|`.
  const groups: boolean[] = []
  for (let at = 0; at < pattern.length; at += 1) {
    const char = pattern[at]
    if (char === '\\') {
      // Escaped, so it is a literal and quantifies nothing.
      at += 1
      continue
    }
    if (char === '[') {
      // A class can hold `(`, `)` and `|` as literals.
      while (at < pattern.length && pattern[at] !== ']') {
        at += pattern[at] === '\\' ? 2 : 1
      }
      continue
    }
    if (char === '(') {
      groups.push(false)
      continue
    }
    if (char === ')') {
      const repeats = groups.pop() ?? false
      const next = pattern[at + 1]
      if (repeats && (next === '+' || next === '*' || next === '{')) {
        return true
      }
      continue
    }
    if (char === '+' || char === '*' || char === '|' || char === '{') {
      const inner = groups.length - 1
      if (inner >= 0) {
        groups[inner] = true
      }
    }
  }
  return false
}

/**
 * An unmatched pattern is an issue; one this refuses to run is not.
 *
 * The regex is the server's, so a pattern this runtime cannot parse — or will
 * not spend the time on — leaves the answer to the server rather than
 * stranding the user on a form nothing can satisfy.
 */
function matchesPattern(pattern: string | undefined, answer: string): boolean {
  if (
    pattern === undefined ||
    answer.length > PATTERN_INPUT_LIMIT ||
    backtracks(pattern)
  ) {
    return true
  }
  try {
    return new RegExp(pattern).test(answer)
  } catch {
    return true
  }
}
