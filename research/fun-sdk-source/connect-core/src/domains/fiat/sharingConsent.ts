import type {
  FiatStepResponse,
  FieldSpec,
  Transition,
} from '@fun-xyz/fiat-contract/types'

import type { SubmitTransition } from '~/domains/fiat/selectTransitions'
import type { TermsToAccept } from '~/domains/fiat/termsAcceptance'

/** fun-backend's MoonPay document-sharing revision; connect-rn pins its English copy to it. */
export const MOONPAY_SHARING_CONSENT_VERSION = '2026-09-l2-kyc-sharing-v3'

export interface SharingConsent {
  transition: SubmitTransition
  terms: TermsToAccept
}

export type SharingConsentInput = Pick<FiatStepResponse, 'state'> &
  Partial<Pick<FiatStepResponse, 'transitions' | 'provider'>>

type TermsSpec = Extract<FieldSpec, { type: 'TERMS_ACCEPTANCE' }>

export function sharingConsentOf(
  envelope: SharingConsentInput,
): SharingConsent | undefined {
  if (
    envelope.provider !== 'MOONPAY' ||
    envelope.state.kind !== 'SESSION_AUTH'
  ) {
    return undefined
  }
  const [consent] = (envelope.transitions ?? []).flatMap(consentsOn)
  return consent
}

function consentsOn(transition: Transition): SharingConsent[] {
  if (transition.mode !== 'SUBMIT') {
    return []
  }
  return Object.entries(transition.inputs ?? {}).flatMap(([name, spec]) => {
    if (!isSharingConsentSpec(spec)) {
      return []
    }
    return [
      {
        transition,
        terms: {
          name,
          documentUrl: spec.documentUrl,
          version: spec.version,
          ...(spec.labelFallback === undefined
            ? {}
            : { labelFallback: spec.labelFallback }),
        },
      },
    ]
  })
}

function isSharingConsentSpec(spec: FieldSpec): spec is TermsSpec {
  return (
    spec.type === 'TERMS_ACCEPTANCE' &&
    spec.version === MOONPAY_SHARING_CONSENT_VERSION
  )
}
