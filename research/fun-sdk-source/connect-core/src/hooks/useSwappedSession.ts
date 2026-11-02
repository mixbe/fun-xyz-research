import { type FormOfPaymentType, PaymentGroup } from '@funkit/api-base'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type {
  SwappedOutboundMessage,
  SwappedTransport,
} from '~/interfaces/swappedTransport'
import type {
  SwappedBuyingCrypto,
  SwappedPillAmounts,
  SwappedTheme,
} from '~/utils/swapped'
import type { FunLogger } from '~/utils/funLogger'

import { useEffectEvent } from './useEffectEvent'

// Same presets on every platform and customer — the embed falls back to its own
// defaults if we never send them. Sent inside the theme payload, so a later
// theme send can't drop them.
const SWAPPED_PILL_AMOUNTS: SwappedPillAmounts = {
  pillAmount1: 25,
  pillAmount2: 50,
  pillAmount3: 100,
  pillAmount4: 200,
}

export interface UseSwappedSessionOptions {
  /** Platform transport (web iframe / RN WebView) implementing the contract. */
  transport: SwappedTransport
  /** Pre-resolved theme payload sent to the embed once it's ready. */
  swappedTheme: SwappedTheme
  /**
   * Destination token shown under the amount. Rides in the theme payload;
   * a change after the embed is ready re-sends the theme so the row updates.
   */
  buyingCrypto?: SwappedBuyingCrypto
  /**
   * The core `FunLogger`. Web and RN both inject the same class with their own
   * `LogTransport` (Datadog browser-logs / Datadog RN), so the class itself is
   * the shared type — no separate interface needed.
   */
  logger: FunLogger
}

export interface SwappedSession {
  /** The embed finished its initial load. Fires once; survives method switches. */
  isSwappedReady: boolean
  /** Whether the embed surface should be visible / interactive. */
  isActive: boolean
  /** Activate for a payment method and tell the embed which method to show. */
  activate: (fopType: FormOfPaymentType) => void
  /** Hide the embed surface (does not reset readiness). */
  deactivate: () => void
  /** Tear the session back down to its initial state. */
  reset: () => void
  /** Ask the embed to focus its amount input. */
  focusAmountInput: () => void
}

/**
 * Platform-agnostic Swapped embed state machine, shared by web (iframe) and
 * React Native (WebView). Owns readiness + active state and the typed message
 * sends; the platform supplies the transport and the pre-built theme.
 *
 * Extracted from `@funkit/connect`'s `SwappedProvider`, which is now a thin
 * wrapper around this.
 */
export function useSwappedSession({
  transport,
  swappedTheme,
  buyingCrypto,
  logger,
}: UseSwappedSessionOptions): SwappedSession {
  const [isActive, setIsActive] = useState(false)
  // Tracks whether the embed app has fully loaded. Not reset when switching
  // payment methods — the embed handles that internally via postMessage.
  const [isSwappedReady, setIsSwappedReady] = useState(false)
  const activeFopTypeRef = useRef<FormOfPaymentType | null>(null)

  // Each sender builds a typed message and routes it through the transport.
  // transport.send returns false when the embed isn't reachable yet; only log
  // on a successful send, preserving the prior early-return behavior.
  const sendSwappedPaymentMethod = useEffectEvent(
    (fopType: FormOfPaymentType) => {
      const msg: SwappedOutboundMessage = {
        type: 'SWAPPED_METHOD',
        method: PaymentGroup[fopType],
      }
      if (transport.send(msg)) {
        logger.info('swapped-provider:sendMethod', { postMessage: msg })
      }
    },
  )

  const sendTheme = useEffectEvent(() => {
    const msg: SwappedOutboundMessage = {
      type: 'SWAPPED_THEME',
      data: { ...swappedTheme, ...SWAPPED_PILL_AMOUNTS, ...buyingCrypto },
    }
    if (transport.send(msg)) {
      logger.info('swapped-provider:sendTheme', {
        postMessage: msg,
        // Duplicates `postMessage.data.buyingCrypto` on purpose: a top-level
        // facet Datadog can group by without indexing the whole theme blob.
        buyingCrypto: buyingCrypto?.buyingCrypto ?? null,
      })
    }
  })

  const focusAmountInput = useEffectEvent(() => {
    const msg: SwappedOutboundMessage = { type: 'SWAPPED_FOCUS' }
    if (transport.send(msg)) {
      logger.info('swapped-provider:focusAmountInput', { postMessage: msg })
    }
  })

  // Wrapped so `logger` stays out of the effect's deps — otherwise a caller
  // that passes a fresh logger each render would re-subscribe the transport
  // listener and risk missing a SWAPPED_READY during the gap.
  const logReadyPreload = useEffectEvent(() => {
    logger.log('swapped-provider:swapped_ready_preload', {
      message: `Preloaded iframe ready for payment method: ${activeFopTypeRef.current}`,
    })
  })

  const activate = useCallback((fopType: FormOfPaymentType) => {
    setIsActive(true)
    activeFopTypeRef.current = fopType
    sendSwappedPaymentMethod(fopType)
  }, [])

  const deactivate = useCallback(() => {
    setIsActive(false)
  }, [])

  const reset = useCallback(() => {
    setIsSwappedReady(false)
    setIsActive(false)
    activeFopTypeRef.current = null
  }, [])

  // The embed only reads the theme from this message, so a destination picked
  // after it booted (preload, dynamic target change) has to be re-sent. Keyed
  // on the fields, not the object, so a fresh-but-equal object sends nothing.
  const buyingCryptoKey = buyingCrypto
    ? `${buyingCrypto.buyingCrypto}|${buyingCrypto.buyingCryptoSrc}`
    : ''
  const lastSentBuyingCryptoKeyRef = useRef(buyingCryptoKey)
  useEffect(() => {
    if (!isSwappedReady) {
      lastSentBuyingCryptoKeyRef.current = buyingCryptoKey
      return
    }
    if (lastSentBuyingCryptoKeyRef.current === buyingCryptoKey) {
      return
    }
    lastSentBuyingCryptoKeyRef.current = buyingCryptoKey
    sendTheme()
  }, [isSwappedReady, buyingCryptoKey])

  // Persistent listener: only handles SWAPPED_READY, which can fire during
  // preload before any step component mounts. Session-scoped events (back,
  // close, navigation, …) are handled by the platform UI.
  useEffect(() => {
    return transport.onMessage((msg) => {
      if (msg.type !== 'SWAPPED_READY') {
        return
      }
      logReadyPreload()
      sendTheme()
      if (activeFopTypeRef.current) {
        sendSwappedPaymentMethod(activeFopTypeRef.current)
      }
      setIsSwappedReady(true)
    })
  }, [transport])

  return useMemo(
    () => ({
      isSwappedReady,
      isActive,
      activate,
      deactivate,
      reset,
      focusAmountInput,
    }),
    [isSwappedReady, isActive, activate, deactivate, reset],
  )
}
