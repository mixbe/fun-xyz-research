import type {
  JsonValue,
  KycSdkResultReport,
} from '@fun-xyz/fiat-contract/types'

export const KYC_SDK_USER_CANCELLED = 'USER_CANCELLED'

const BARE_SDK_CODE = /^[A-Za-z0-9_-]{1,64}$/
const FREE_TEXT_ERROR_TYPE = 'sdk_error'

type FailedKycSdkResult = Extract<KycSdkResultReport, { outcome: 'FAILED' }>

export function kycSdkCompleted(): KycSdkResultReport {
  return { outcome: 'COMPLETED' }
}

/** Never the SDK's raw text: only a bare code reaches the backend. */
export function kycSdkFailed(code: string): FailedKycSdkResult {
  return {
    outcome: 'FAILED',
    errorType: BARE_SDK_CODE.test(code) ? code : FREE_TEXT_ERROR_TYPE,
  }
}

export function readKycSdkResult(
  value: Readonly<Record<string, JsonValue>> | undefined,
): KycSdkResultReport | undefined {
  if (value?.outcome === 'COMPLETED') {
    return kycSdkCompleted()
  }
  if (value?.outcome === 'FAILED' && typeof value.errorType === 'string') {
    return kycSdkFailed(value.errorType)
  }
  return undefined
}
