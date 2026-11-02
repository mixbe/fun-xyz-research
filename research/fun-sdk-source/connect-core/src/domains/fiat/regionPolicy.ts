/**
 * Where fiat deposits are served, as ops configures it (Statsig
 * `fiatv2regionpolicy`).
 *
 * - `deny` is read first; `allow` carves exceptions back out of it.
 * - Empty lists serve everywhere, so an unreachable Statsig never blocks a
 *   buyer the backend would have priced.
 */
export interface FiatRegionPolicy {
  deny: readonly string[]
  allow: readonly string[]
}

/** The buyer's IP-resolved location; `state` is empty when unresolved. */
export interface FiatRegionGeo {
  alpha2: string
  state: string
}

export interface FiatRegionVerdict {
  supported: boolean
  /** The entry that decided it; absent when nothing matched. */
  matched?: string
  /** Which list that entry came from. */
  source?: 'deny' | 'allow'
  /** Entries passed over: no subdivision to judge them by, or unreadable. */
  skipped?: readonly string[]
  /**
   * A deny stood, but an `allow` entry that could not be judged might have
   * lifted it — so the buyer is let through for the backend to rule on.
   */
  deferred?: true
}

/** Matches every buyer, whatever their country. */
const WILDCARD = '*'

const COUNTRY = /^[A-Z]{2}$/
const SUBDIVISION = /^([A-Z]{2})-([A-Z0-9]{1,3})$/

interface Entry {
  raw: string
  /** {@link WILDCARD}, or the country half. */
  alpha2: string
  subdivision?: string
}

/**
 * How far an entry reaches. A tighter entry beats a looser one, which is what
 * lets `US-NY` stand as an exception to `US`, and `AU` as one to `*`.
 */
const REACH = {
  everywhere: 0,
  country: 1,
  subdivision: 2,
} as const

type Reach = (typeof REACH)[keyof typeof REACH]

type EntryMatch =
  | { kind: 'match'; reach: Reach }
  | { kind: 'miss' }
  /** The buyer's subdivision is unknown, so this entry cannot be judged. */
  | { kind: 'skip' }

/** Unparseable entries are dropped rather than guessed at. */
function parseEntry(raw: string): Entry | undefined {
  const value = raw.trim().toUpperCase()
  if (value === WILDCARD) {
    return { raw, alpha2: WILDCARD }
  }
  if (COUNTRY.test(value)) {
    return { raw, alpha2: value }
  }
  const parts = SUBDIVISION.exec(value)
  return parts === null
    ? undefined
    : { raw, alpha2: parts[1], subdivision: parts[2] }
}

function matchEntry(entry: Entry, geo: FiatRegionGeo): EntryMatch {
  if (entry.alpha2 === WILDCARD) {
    return { kind: 'match', reach: REACH.everywhere }
  }
  if (entry.alpha2 !== geo.alpha2) {
    return { kind: 'miss' }
  }
  if (entry.subdivision === undefined) {
    return { kind: 'match', reach: REACH.country }
  }
  // The country matched but the subdivision is unknowable — see
  // {@link resolveFiatRegionSupport} on why that drops the entry entirely.
  if (geo.state.length === 0) {
    return { kind: 'skip' }
  }
  return entry.subdivision === geo.state
    ? { kind: 'match', reach: REACH.subdivision }
    : { kind: 'miss' }
}

interface ListMatch {
  entry: string
  reach: Reach
}

interface ReadList {
  entries: readonly string[]
  /** Something was there that could not be read as an entry. */
  lost: boolean
}

/**
 * Ops edits this policy as raw JSON, so a list can arrive missing, as
 * something other than a list, or holding `null`, numbers or objects. None of
 * that may throw inside the deposit sheet, so anything unreadable is dropped —
 * and `lost` records that something was, because a dropped `allow` entry is an
 * exception the buyer should have had.
 */
function readList(entries: unknown): ReadList {
  if (!Array.isArray(entries)) {
    // An absent list is "no entries", not a loss — a policy may legitimately
    // carry no exceptions. Anything else present is a loss.
    return { entries: [], lost: entries !== undefined && entries !== null }
  }
  const strings = entries.filter(
    (entry): entry is string => typeof entry === 'string',
  )
  return { entries: strings, lost: strings.length !== entries.length }
}

/** The tightest entry in one list that covers this buyer. */
function tightestMatch(
  list: ReadList,
  geo: FiatRegionGeo,
  skipped: string[],
): { match?: ListMatch; lost: boolean } {
  let best: ListMatch | undefined
  let lost = list.lost
  for (const raw of list.entries) {
    const entry = parseEntry(raw)
    if (entry === undefined) {
      // `US-NEWYORK` and friends: a typo here is the same loss as a `null`.
      lost = true
      skipped.push(raw)
      continue
    }
    const result = matchEntry(entry, geo)
    if (result.kind === 'skip') {
      skipped.push(raw)
      continue
    }
    if (
      result.kind === 'match' &&
      (best === undefined || result.reach > best.reach)
    ) {
      best = { entry: raw, reach: result.reach }
    }
  }
  return { match: best, lost }
}

/**
 * Whether the buyer's region is served, per the deny-then-allow policy.
 *
 * - The tightest matching entry decides; `allow` wins a tie, since it exists
 *   only to override.
 * - An entry that cannot be judged does not participate. With no subdivision
 *   resolved, `US-NY` neither denies nor rescues.
 * - A block an unjudgeable exception might have lifted is not a block. This
 *   gate exists to spare the buyer wasted effort, not to enforce anything —
 *   the backend refuses a corridor it cannot serve either way — so a New
 *   Yorker whose state went unresolved reaches the amount screen rather than
 *   a terminal screen we cannot stand behind.
 */
export function resolveFiatRegionSupport(
  policy: FiatRegionPolicy | undefined,
  geo: FiatRegionGeo | undefined,
): FiatRegionVerdict {
  if (geo === undefined) {
    return { supported: true }
  }
  const buyer: FiatRegionGeo = {
    alpha2: geo.alpha2.trim().toUpperCase(),
    state: geo.state.trim().toUpperCase(),
  }
  const deniedSkipped: string[] = []
  const allowedSkipped: string[] = []
  const denied = tightestMatch(readList(policy?.deny), buyer, deniedSkipped)
  const allowed = tightestMatch(readList(policy?.allow), buyer, allowedSkipped)
  const skipped = [...deniedSkipped, ...allowedSkipped]
  const trailer = skipped.length === 0 ? {} : { skipped }

  if (denied.match === undefined) {
    return { supported: true, ...trailer }
  }
  if (
    allowed.match !== undefined &&
    allowed.match.reach >= denied.match.reach
  ) {
    return {
      supported: true,
      matched: allowed.match.entry,
      source: 'allow',
      ...trailer,
    }
  }
  // Only the `allow` side could have overturned this, so only a gap there
  // matters — unreadable or unjudgeable, both cost the buyer an exception. A
  // `deny` entry we could not read would merely have added a second reason for
  // the same answer.
  if (allowed.lost || allowedSkipped.length > 0) {
    return { supported: true, deferred: true, ...trailer }
  }
  return {
    supported: false,
    matched: denied.match.entry,
    source: 'deny',
    ...trailer,
  }
}
