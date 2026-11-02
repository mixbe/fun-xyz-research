import { formatCurrencyAndStringify, formatPercent } from './formatNumber'

export interface FormatDynamicFeeUsdOptions {
  /**
   * Threshold in USD above which the fee should be displayed in %
   *
   * Defauls to 2.5
   *
   * Pass null to disable % format altogether
   */
  percentThreshold?: number | null
}

const FEE_MIN_DISPLAYABLE_AMOUNT_USD = 0.01
/** Minimum USD amount before showing as percent */
const FEE_MIN_PERCENT_THRESHOLD_AMOUNT_USD = 2.5

/**
 * For any fees, if the total fee amounts to less than $2.50, show the fee as a strict dollar value.
 * If the fee is greater than $2.50, show it as a percent.
 * If the fee is less than $0.01, show <$0.01 instead.
 * If the fee is $0.00, show $0.00.
 */
export function formatDynamicFeeUsd(
  fee: number,
  total: number,
  options: FormatDynamicFeeUsdOptions = {},
) {
  if (fee > 0) {
    if (fee < FEE_MIN_DISPLAYABLE_AMOUNT_USD) {
      return `<${formatCurrencyAndStringify(FEE_MIN_DISPLAYABLE_AMOUNT_USD)}`
    }

    const { percentThreshold = FEE_MIN_PERCENT_THRESHOLD_AMOUNT_USD } = options
    if (percentThreshold !== null && fee > percentThreshold) {
      return formatPercent((fee / total) * 100)
    }
  }

  return formatCurrencyAndStringify(fee)
}
