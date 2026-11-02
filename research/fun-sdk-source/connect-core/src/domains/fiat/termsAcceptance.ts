import type { JsonValue } from '@fun-xyz/fiat-contract/types'

import type { EntryCta } from '~/domains/fiat/entryCta'
import { submittableTransition } from '~/domains/fiat/entryCta'

export interface TermsToAccept {
  /** The transition's input name — the key the answer is sent back under. */
  name: string
  /** The document the user is accepting. They cannot accept what they cannot read. */
  documentUrl: string
  /**
   * Which revision, opaque to us and echoed back verbatim, so a later dispute
   * names the text the user saw rather than whatever is at the URL today.
   */
  version: string
  /** The server's own wording for the control, when it sends one. */
  labelFallback?: string
}

/** The terms a transition will not go through without. */
export function termsToAccept(entry: EntryCta): TermsToAccept | undefined {
  const transition = submittableTransition(entry)
  const found = Object.entries(transition?.inputs ?? {}).find(
    ([, spec]) => spec.type === 'TERMS_ACCEPTANCE',
  )
  if (found === undefined) {
    return undefined
  }
  const [name, spec] = found
  if (spec.type !== 'TERMS_ACCEPTANCE') {
    return undefined
  }
  return {
    name,
    documentUrl: spec.documentUrl,
    version: spec.version,
    ...(spec.labelFallback === undefined
      ? {}
      : { labelFallback: spec.labelFallback }),
  }
}

/**
 * The answer to a `TERMS_ACCEPTANCE` input: the revision shown, and when it
 * was accepted.
 *
 * `acceptedAt` asserts a tap that happened, so it is stamped at the tap and
 * never defaulted — the server rejects anything that is not an ISO-8601
 * instant with an explicit timezone, and a made-up one would be a false record
 * of consent.
 */
export function acceptedTerms(
  terms: TermsToAccept,
  acceptedAt: Date,
): JsonValue {
  return { version: terms.version, acceptedAt: acceptedAt.toISOString() }
}
