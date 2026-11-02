import { FUN_KYC_CONSENT_DOCUMENTS } from '@fun-xyz/fiat-contract/terms'
import type {
  FunKycConsentLocale,
  TermsDocument,
  TermsDocumentAcceptance,
} from '@fun-xyz/fiat-contract/terms'

/**
 * The documents as this screen showed them: Fun's KYC consent carries the digest of the locale it
 * was read in. Any other document, or an unknown locale, stays as the backend sent it.
 */
export function localizedTerms(
  documents: readonly TermsDocument[],
  locale: string | undefined,
): readonly TermsDocument[] {
  const shown =
    locale !== undefined && locale in FUN_KYC_CONSENT_DOCUMENTS
      ? FUN_KYC_CONSENT_DOCUMENTS[locale as FunKycConsentLocale]
      : undefined
  return shown === undefined
    ? documents
    : documents.map((document) =>
        document.id === shown.id && document.version === shown.version
          ? { ...document, contentDigest: shown.contentDigest }
          : document,
      )
}

/** The acceptance of every document one screen showed, stamped with the tap. */
export function termsAcceptances(
  documents: readonly TermsDocument[],
  acceptedAt: string,
): TermsDocumentAcceptance[] {
  return documents.map((document) => ({
    documentId: document.id,
    version: document.version,
    contentDigest: document.contentDigest,
    acceptedAt,
  }))
}
