export const fullMonthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const shortenedMonthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

function getDaySuffix(day: number): string {
  if (day >= 11 && day <= 13) {
    return 'th'
  }
  const lastDigit = day % 10
  switch (lastDigit) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

interface FormatDateOption {
  year?: 'full' | 'short' | 'none'
  month?: 'full' | 'short'
}

export function formatTimestampToDate(
  date: Date,
  { year = 'full', month = 'full' }: FormatDateOption = {},
) {
  const monthIdx = date.getMonth()
  const monthStr =
    month === 'short' ? shortenedMonthNames[monthIdx] : fullMonthNames[monthIdx]
  const day = date.getDate()
  const yearStr =
    year === 'none'
      ? ''
      : date
          .getFullYear()
          .toString()
          .slice(year === 'full' ? 0 : 2)
  const daySuffix = getDaySuffix(day)
  return `${monthStr} ${day}${daySuffix}${yearStr ? `, ${yearStr}` : ''}`
}

interface FormatTimeOption extends FormatDateOption {
  hours?: '24hr' | '12hr'
  seconds?: 'none'
}

export function formatTimestamp(
  date: Date,
  opt: FormatTimeOption = {},
): string {
  const { hours = '12hr', seconds } = opt
  const minutes = date.getMinutes()
  const sec = date.getSeconds()
  const secondsStr = seconds === 'none' ? '' : sec < 10 ? `0${sec}` : sec
  const hrs = date.getHours()
  const hoursStr = hours === '24hr' ? hrs : hrs % 12 || 12
  const amOrPm = hours === '24hr' ? '' : hrs >= 12 ? 'PM' : 'AM'

  return `${formatTimestampToDate(date, opt)} · ${hoursStr}:${
    minutes < 10 ? '0' : ''
  }${minutes}${secondsStr ? `:${secondsStr}` : ''}${amOrPm ? ` ${amOrPm}` : ''}`
}

interface TimeFormatStrings {
  /** String for "< 1 min" when specifyUnderMinute is true */
  lessThanOneMin?: string
  /** Function to format seconds: (count: number) => string. Default: "{count} seconds" */
  seconds?: (count: number) => string
  /** Function to format minutes: (count: number) => string. Default: "{count} min" */
  minutes?: (count: number) => string
  /** Function to format hours: (count: number) => string. Default: "{count} h" */
  hours?: (count: number) => string
  /** Function to format short seconds: (count: number) => string. Default: "{count} s" */
  secondsShort?: (count: number) => string
}

/**
 * Formats seconds to mins and seconds string
 * - seconds = 10, output = '10 seconds'
 * - seconds = 20.3, output = '21 seconds'
 * - seconds = 20.3, specifyUnderMinute=true, output = '< 1 min'
 * - seconds = 60, output = '60 seconds'
 * - seconds = 61, output = '1 min 1 s'
 * - seconds = 300, output = '5 min'
 * - seconds = 320, output = '5 min 20 s'
 * - seconds = 320, omitSeconds=true, output = '6 min'
 * - seconds = 3600, output = '60 min'
 * - seconds = 3900, output = '1 h 5 min'
 * - seconds = 3920, output = '1 h 5 min 20 s'
 *
 * @param seconds - Number of seconds to format
 * @param specifyUnderMinute - If true, shows "< 1 min" for values under 60 seconds
 * @param omitSeconds - If true, rounds up to nearest minute
 * @param i18n - Optional translation strings for internationalization
 */
export function formatSecondsToReadableForm(
  seconds: number,
  specifyUnderMinute = false,
  omitSeconds = false,
  i18n?: TimeFormatStrings,
): string {
  const normalizedSeconds = Math.ceil(seconds)

  // Default English formatters
  const formatSeconds = i18n?.seconds ?? ((count: number) => `${count} seconds`)
  const formatMinutes = i18n?.minutes ?? ((count: number) => `${count} min`)
  const formatHours = i18n?.hours ?? ((count: number) => `${count} h`)
  const formatSecondsShort =
    i18n?.secondsShort ?? ((count: number) => `${count} s`)
  const lessThanOneMin = i18n?.lessThanOneMin ?? '< 1 min'

  if (normalizedSeconds === 1) {
    return formatSeconds(1).replace(/s$/, '') // Remove plural 's' for single second
  }
  if (normalizedSeconds <= 60) {
    return specifyUnderMinute
      ? lessThanOneMin
      : formatSeconds(normalizedSeconds)
  }

  const s = omitSeconds ? 0 : normalizedSeconds % 60
  const m = Math.ceil((normalizedSeconds - s) / 60) % 60
  const h = Math.ceil((normalizedSeconds - s - m * 60) / 60 / 60)

  // Special case - show '60min' instead of '1h'
  if (h === 1 && m === 0 && s === 0) {
    return formatMinutes(60)
  }

  return [
    h ? formatHours(h) : '',
    m ? formatMinutes(m) : '',
    s ? formatSecondsShort(s) : '',
  ]
    .filter(Boolean)
    .join(' ')
}

export function formatSecondsToCountdownForm(seconds: number) {
  const normalizedSeconds = Math.ceil(seconds)
  const mins = Math.floor(normalizedSeconds / 60)
  const remainingSecs = normalizedSeconds % 60
  return `${(mins < 10 ? '0' : '') + mins}:${
    (remainingSecs < 10 ? '0' : '') + remainingSecs
  }`
}
