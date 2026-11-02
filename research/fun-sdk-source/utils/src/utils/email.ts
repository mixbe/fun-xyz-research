/** Direct copy of Zod email regex: https://zod.dev/api?id=emails#emails */
const EMAIL_REGEX =
  /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-.]*)[a-z0-9_+-]@([a-z0-9][a-z0-9-]*\.)+[a-z]{2,}$/i

/**
 * Normalize (trim + lowercase) and validate an email address.
 *
 * Returns the normalized email when valid, or `null` when the input is missing,
 * empty, or fails validation.
 *
 * This frontend check must be equal to or *less* restrictive than
 * the backend.
 */
export function normalizeAndValidateEmail(
  email: string | undefined | null,
): string | null {
  if (!email) {
    return null
  }
  const normalizedEmail = email.trim().toLowerCase()
  return EMAIL_REGEX.test(normalizedEmail) ? normalizedEmail : null
}

/** Boolean predicate built on the same normalization as `normalizeAndValidateEmail`. */
export function isValidEmail(email: string | undefined | null): boolean {
  return normalizeAndValidateEmail(email) !== null
}
