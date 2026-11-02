import type {
  GenericFormOfPayment,
  SwappedFormOfPayment,
} from '@funkit/api-base'
import type { PaymentMethod } from './paymentMethods'

/**
 * A non-Swapped payment method (e.g. Cash App Lightning) rendered inside the
 * Swapped FOP list. Structurally a `GenericFormOfPayment` so it flows through the
 * shared list machinery (sort, sectioning, slicing, empty-state) unchanged, but:
 * - `fopType` is a plain token (NOT a backend `FormOfPaymentType`) used for
 *   priority ordering and, via `getFopKey`, as the row's stable identity,
 * - `embeddedFlowUrl` is always empty (no embedded Swapped flow),
 * - `paymentMethod` is the marker the type guard keys off.
 */
export interface SyntheticFormOfPayment extends Omit<
  GenericFormOfPayment,
  'fopType' | 'embeddedFlowUrl'
> {
  fopType: string
  embeddedFlowUrl: ''
  paymentMethod: PaymentMethod.CASH_APP_LIGHTNING
}

export type ListFormOfPayment = SwappedFormOfPayment | SyntheticFormOfPayment

export function isSyntheticFop(
  fop: ListFormOfPayment,
): fop is SyntheticFormOfPayment {
  return 'paymentMethod' in fop
}

// Currently all non-synthetic FOPs are from same Swapped provider even though
// the data structure is generic.
export function isSwappedFop(
  fop: ListFormOfPayment,
): fop is SwappedFormOfPayment {
  return !isSyntheticFop(fop)
}

/** Stable identity for keys and active-selection comparison. */
export function getFopKey(fop: ListFormOfPayment): string {
  return fop.embeddedFlowUrl || fop.fopType
}

export function createSyntheticFop(
  paymentMethod: SyntheticFormOfPayment['paymentMethod'],
): SyntheticFormOfPayment {
  return {
    paymentMethod,
    // Uppercase for consistency with Swapped fopType
    // NATIVE_ prefix to ensure no collision
    fopType: `NATIVE_${paymentMethod.toUpperCase()}`,
    name: '',
    embeddedFlowUrl: '',
    iconImageUrl: '',
    metadata: { checkoutLimit: {} },
  }
}
