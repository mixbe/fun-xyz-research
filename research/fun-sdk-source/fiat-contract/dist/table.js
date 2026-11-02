"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/table.ts
var table_exports = {};
__export(table_exports, {
  DOCUMENTED_ENDPOINTS: () => DOCUMENTED_ENDPOINTS,
  FUN_AUTH_ERROR_CODES: () => FUN_AUTH_ERROR_CODES,
  STATE_KEYS: () => STATE_KEYS,
  TABLE_VERSION: () => TABLE_VERSION,
  TERMINAL_ORDER_STATUSES: () => TERMINAL_ORDER_STATUSES,
  TRANSITION_TABLE: () => TRANSITION_TABLE,
  UNOFFERED_ENDPOINTS: () => UNOFFERED_ENDPOINTS,
  UNREACHABLE_STATES: () => UNREACHABLE_STATES,
  isTerminal: () => isTerminal,
  stateKey: () => stateKey,
  tableEntry: () => tableEntry,
  unofferedEndpoints: () => unofferedEndpoints,
  unreachableStates: () => unreachableStates
});
module.exports = __toCommonJS(table_exports);

// package.json
var version = "0.49.0";

// src/table.ts
var TABLE_VERSION = version;
var TERMINAL_ORDER_STATUSES = [
  "SETTLED",
  "EXPIRED",
  "CANCELLED",
  "FAILED",
  "REFUNDED"
];
var FUN_AUTH_ERROR_CODES = [
  "INVALID_EMAIL",
  "BAD_CODE",
  "CODE_EXPIRED",
  "TOO_MANY_ATTEMPTS",
  "OTP_DISPATCH_THROTTLED"
];
var KYC_ANY = [
  "KYC/CAPTURE",
  "KYC/INPUT_REQUIRED",
  "KYC/NO_ACTION_REQUIRED:IN_REVIEW",
  "KYC/NO_ACTION_REQUIRED:ON_HOLD",
  "KYC/NO_ACTION_REQUIRED:REJECTED"
];
var TRANSITION_TABLE = {
  QUOTE: {
    key: "QUOTE",
    kind: "QUOTE",
    screens: [1],
    docStatus: "SPECIFIED",
    allowedTransitions: [
      {
        id: "continue",
        mode: "SUBMIT",
        endpoint: "POST /fiat/session",
        when: "no valid provider session token (own-tables check)"
      },
      {
        id: "open_session",
        mode: "SUBMIT",
        endpoint: "POST /fiat/payment-session",
        when: "returning user, session + KYC valid, capture-first rail \u2014 the method authorises before any order exists",
        note: "Returns PAYMENT{CAPTURE} carrying the Surface. Without this entry the capture-first rail has no legal way in: a transition-following client takes POST /fiat/orders instead, and the backend refuses that when the provider declares the capture-first capability and no authorisation is present. Named open_session per the Fiat Contract 0.7 doc, which adds quote-time-minted surface rows beside it."
      },
      {
        id: "continue",
        mode: "SUBMIT",
        endpoint: "POST /fiat/orders",
        when: "returning user, session + KYC valid, order-first rail \u2014 the quote screen doubles as review",
        note: "Narrowed to the order-first rail: on a capture-first method the order cannot be created before the payment is authorised, so the sibling payment-session entry is the one that applies."
      },
      {
        id: "capture",
        mode: "CLIENT_SURFACE",
        endpoint: "POST /fiat/orders",
        when: "capture-then-order rail whose session is minted at quote time (inline pay sheet)",
        note: "The 0.7 row that makes the single-screen Apple Pay design legal: the surface rides QUOTE, the provider component IS the primary CTA, and its result creates the order. Apple policy forbids a visible step between an Apple-branded tap and the sheet, and TransakApplePay exposes no programmatic trigger, so a two-step via payment-session cannot serve this rail. Requires state.surface (\u03942)."
      },
      {
        id: "capture",
        mode: "CLIENT_SURFACE",
        endpoint: "POST /fiat/orders/:id/surface-result",
        when: "order-then-capture rail whose provider order was created with the quote-time session",
        note: "Same quote-time placement, other topology: the order already exists, so the surface reports against it rather than creating one."
      }
    ],
    mayReturn: [
      "SESSION_AUTH",
      ...KYC_ANY,
      "PAYMENT/CAPTURE",
      "PAYMENT/INSTRUCT",
      "PENDING_ORDER",
      "ORDER/AWAITING_CONFIRMATION",
      "ORDER/CREATED",
      "BLOCKED"
    ],
    terminal: false,
    notes: [
      "Re-quote on amount change is a client-local event, not a transition. A new quote carries a new surface; the client remounts the adapter rather than reusing the old session.",
      "A surface on QUOTE and a SUBMIT to the same endpoint may not coexist \u2014 two paths to one order. assertLegalEmission enforces it; the server picks one per rail.",
      `Both PAYMENT states are reachable directly from QUOTE: the FE doc canvas draws S1 \u2192 S5 (card, capture-first) and S1 \u2192 S6 (bank). This entry was first ported from the FE doc's bindings table, whose "May receive back" column omits both \u2014 the canvas is the correct source of the two.`,
      'TODO(open-decision): contract \xA7"Proposal: remove PENDING_ORDER" would additionally have QUOTE return ORDER{CREATED} for an active order. That decision does not gate the PAYMENT edges above.'
    ]
  },
  FUN_AUTH: {
    key: "FUN_AUTH",
    kind: "FUN_AUTH",
    screens: [],
    docStatus: "SPECIFIED",
    allowedTransitions: [
      { id: "start", mode: "SUBMIT", endpoint: "POST /fiat/auth", when: "phase IDENTIFIER \u2014 inputs { email: TEXT }" },
      {
        id: "verify",
        mode: "SUBMIT",
        endpoint: "POST /fiat/auth/verify",
        when: "phase CODE \u2014 params { verificationRef }, inputs { otpCode: TEXT length 6, regex ^\\d{6}$ }"
      },
      {
        id: "resend",
        mode: "SUBMIT",
        endpoint: "POST /fiat/auth",
        when: "phase CODE, once resendAvailableAtMs has passed \u2014 params { verificationRef }"
      }
    ],
    mayReturn: ["FUN_AUTH"],
    terminal: false,
    notes: [
      "Answered, in phase IDENTIFIER with the start transition, to the entry quote request (POST /fiat/routing/quote or POST /fiat/quote) of a Fun-run login that holds no session; no state returns it, and a customer-asserted identity never sees it.",
      "VERIFIED carries no transitions. A Fun-run login also carries `session` on the envelope; the SDK then starts the flow at QUOTE with `accessToken` as Bearer.",
      "Not in the FE doc, so no screen number: the client renders it on its contact and OTP screens.",
      "Every FUN_AUTH error is category USER_ERROR with a code from FUN_AUTH_ERROR_CODES. A wrong code re-enters CODE with BAD_CODE and a lower attemptsRemaining; TOO_MANY_ATTEMPTS and CODE_EXPIRED drop the challenge and offer resend; OTP_DISPATCH_THROTTLED re-enters with resendAvailableAtMs set.",
      "resend carries the verificationRef the client holds, even one the server has dropped (expired, too many attempts); the server starts a fresh challenge for the same email while it still remembers the challenge (its code expiry plus a short grace); once it is forgotten the answer is IDENTIFIER with CODE_EXPIRED.",
      "POST /fiat/auth/refresh and /revoke are called by the SDK session store, never offered as transitions."
    ]
  },
  SESSION_AUTH: {
    key: "SESSION_AUTH",
    kind: "SESSION_AUTH",
    screens: [2],
    docStatus: "SPECIFIED",
    allowedTransitions: [
      { id: "start", mode: "SUBMIT", endpoint: "POST /fiat/session" },
      { id: "verify", mode: "SUBMIT", endpoint: "POST /fiat/session/verify" },
      {
        id: "report_auth_result",
        mode: "CLIENT_SURFACE",
        endpoint: "POST /fiat/session/verify",
        note: "Reports a provider-owned authentication surface result; the backend alone reassesses and selects the next state."
      }
    ],
    mayReturn: [
      "SESSION_AUTH",
      "QUOTE",
      "PAYMENT/CAPTURE",
      ...KYC_ANY,
      "ORDER/AWAITING_CONFIRMATION",
      "PENDING_ORDER"
    ],
    terminal: false,
    notes: [
      "A bad code re-enters this same state with error {category: USER_ERROR, code: BAD_CODE} \u2014 banner, not a screen change.",
      "No resend affordance is specified in either doc (known gap, FE doc Screen 2).",
      "A provider-owned surface may declare client-executed delivery from allowlisted CURRENT_SESSION_INPUTS only.",
      "A provider-owned authentication surface reports through CLIENT_SURFACE; it is not a user-entered OTP submission."
    ]
  },
  "KYC/CAPTURE": {
    key: "KYC/CAPTURE",
    kind: "KYC",
    phase: "CAPTURE",
    screens: [8],
    docStatus: "SPECIFIED",
    allowedTransitions: [
      {
        id: "refresh_sdk_token",
        mode: "SUBMIT",
        endpoint: "POST /fiat/kyc/sdk-token",
        note: "Refreshes an expired SDK credential and returns a new KYC/CAPTURE state."
      },
      {
        id: "capture",
        mode: "CLIENT_SURFACE",
        endpoint: "POST /fiat/kyc/capture",
        note: "Reports SDK submission; provider eligibility is re-evaluated through quote orchestration."
      }
    ],
    mayReturn: [
      "KYC/CAPTURE",
      "KYC/INPUT_REQUIRED",
      "KYC/NO_ACTION_REQUIRED:IN_REVIEW",
      "KYC/NO_ACTION_REQUIRED:ON_HOLD",
      "KYC/NO_ACTION_REQUIRED:REJECTED",
      "QUOTE",
      "PAYMENT/CAPTURE",
      "PAYMENT/INSTRUCT",
      "ORDER/AWAITING_CONFIRMATION"
    ],
    terminal: false,
    notes: [
      "Carries the handshake-gated KYC_SDK surface; provider selects the identity-vendor adapter.",
      "SDK completion or failure is only a launch report; eligibility is re-read authoritatively by the backend."
    ]
  },
  "KYC/INPUT_REQUIRED": {
    key: "KYC/INPUT_REQUIRED",
    kind: "KYC",
    phase: "INPUT_REQUIRED",
    screens: [3],
    docStatus: "SPECIFIED",
    allowedTransitions: [
      { id: "submit_round", mode: "SUBMIT", endpoint: "POST /fiat/kyc/form" }
    ],
    mayReturn: [
      "KYC/CAPTURE",
      "KYC/INPUT_REQUIRED",
      "KYC/NO_ACTION_REQUIRED:IN_REVIEW",
      "KYC/NO_ACTION_REQUIRED:ON_HOLD",
      "KYC/NO_ACTION_REQUIRED:REJECTED",
      "QUOTE",
      "PAYMENT/CAPTURE",
      "PAYMENT/INSTRUCT",
      "ORDER/AWAITING_CONFIRMATION"
    ],
    terminal: false,
    notes: [
      "One POST per round; conditional requirements may open another round.",
      "FILE fields use POST /fiat/kyc/document to obtain or report a direct provider/vendor upload; document bytes never transit Fun. The harness owns this auxiliary path, not a transition.",
      "Hosted KYC links arrive as HOSTED_LINK form fields, not as a Surface."
    ]
  },
  "KYC/NO_ACTION_REQUIRED:IN_REVIEW": {
    key: "KYC/NO_ACTION_REQUIRED:IN_REVIEW",
    kind: "KYC",
    phase: "NO_ACTION_REQUIRED",
    reason: "IN_REVIEW",
    screens: [9],
    docStatus: "SPECIFIED",
    allowedTransitions: [{ id: "poll", mode: "AWAIT", endpoint: "GET /fiat/quotes/:quoteRef" }],
    mayReturn: [
      "KYC/NO_ACTION_REQUIRED:IN_REVIEW",
      "KYC/CAPTURE",
      "KYC/INPUT_REQUIRED",
      "KYC/NO_ACTION_REQUIRED:ON_HOLD",
      "KYC/NO_ACTION_REQUIRED:REJECTED",
      "QUOTE",
      "PAYMENT/CAPTURE",
      "PAYMENT/INSTRUCT",
      "ORDER/AWAITING_CONFIRMATION"
    ],
    terminal: false,
    notes: [
      "Documented poll shape: intervalMs 3000, backoffFactor 1.5, maxIntervalMs 10000, giveUpAfterMs 90000.",
      "Pre-order giveUp destination is a design gap (FE doc Screen 9) \u2014 client-local, no contract impact."
    ]
  },
  "KYC/NO_ACTION_REQUIRED:ON_HOLD": {
    key: "KYC/NO_ACTION_REQUIRED:ON_HOLD",
    kind: "KYC",
    phase: "NO_ACTION_REQUIRED",
    reason: "ON_HOLD",
    screens: [10],
    docStatus: "SPECIFIED",
    allowedTransitions: [],
    mayReturn: KYC_ANY,
    terminal: false,
    notes: [
      "THE proof that terminality is not array emptiness: transitions [] and NOT terminal. Re-entry after retryAfter re-derives."
    ]
  },
  "KYC/NO_ACTION_REQUIRED:REJECTED": {
    key: "KYC/NO_ACTION_REQUIRED:REJECTED",
    kind: "KYC",
    phase: "NO_ACTION_REQUIRED",
    reason: "REJECTED",
    screens: [11],
    docStatus: "SPECIFIED",
    allowedTransitions: [],
    mayReturn: [],
    terminal: true,
    notes: [
      "Only explicit non-retryable outcomes reach REJECTED. Correctable failures return CAPTURE or INPUT_REQUIRED; provider-specific declines re-route before becoming user rejection."
    ]
  },
  PENDING_ORDER: {
    key: "PENDING_ORDER",
    kind: "PENDING_ORDER",
    screens: [12],
    docStatus: "SPECIFIED",
    allowedTransitions: [
      { id: "resume", mode: "SUBMIT", endpoint: "GET /fiat/orders/:id" },
      { id: "cancel", mode: "SUBMIT", endpoint: "POST /fiat/orders/:id/cancel" }
    ],
    mayReturn: ["ORDER/CREATED", "QUOTE"],
    terminal: false,
    notes: [
      'TODO(open-decision): removal proposed (contract \xA7"Proposal: remove PENDING_ORDER"); FE Screen 12 is frozen until it lands. The two-call resume-or-cancel shape is why transitions is an array.',
      "SUBMIT is a user-fired request, not a POST: GET /fiat/orders/:id under SUBMIT is legal."
    ]
  },
  BLOCKED: {
    key: "BLOCKED",
    kind: "BLOCKED",
    screens: [16],
    docStatus: "SPECIFIED",
    allowedTransitions: [],
    mayReturn: [],
    terminal: true,
    notes: [
      "Region/compliance block \u2014 fires from anywhere (contract \xA7Global transitions). retryAfter renders a dated comeback; null = none.",
      "TODO(open-decision): v1 scope assumed yes for FCA/UK \u2014 product confirm (FE doc open question 4)."
    ]
  },
  "PAYMENT/CAPTURE": {
    key: "PAYMENT/CAPTURE",
    kind: "PAYMENT",
    phase: "CAPTURE",
    screens: [5],
    docStatus: "SPECIFIED",
    allowedTransitions: [
      {
        id: "capture",
        mode: "CLIENT_SURFACE",
        endpoint: "POST /fiat/orders",
        when: "capture-then-order topology (Transak headless cards: the component yields requestId, an input to createOrder)",
        note: 'TODO(open-decision): report target per card topology \u2014 Transak ask (contract Flow A: "confirm before freeze").'
      },
      {
        id: "capture",
        mode: "CLIENT_SURFACE",
        endpoint: "POST /fiat/orders/:id/surface-result",
        when: "the order already exists (order-then-capture topology)",
        note: 'Endpoint per contract \xA7Endpoints ("client reports CLIENT_SURFACE outcome; backend reconciles vs webhooks").'
      }
    ],
    mayReturn: ["ORDER/CREATED", "PAYMENT/CAPTURE", "QUOTE"],
    terminal: false,
    notes: [
      "Decline re-entry: same state, fresh surface.session, error {category: PAYMENT_DECLINED, retryable: true, recovery: RETRY_PAYMENT}.",
      "The Surface is carried in state, never in the transition (\u03942, single-carry)."
    ]
  },
  "PAYMENT/INSTRUCT": {
    key: "PAYMENT/INSTRUCT",
    kind: "PAYMENT",
    phase: "INSTRUCT",
    screens: [6],
    docStatus: "SPECIFIED",
    allowedTransitions: [
      {
        id: "confirm_paid",
        mode: "SUBMIT",
        endpoint: "POST /fiat/orders/:id/confirm-payment"
      },
      {
        id: "cancel",
        mode: "SUBMIT",
        endpoint: "POST /fiat/orders/:id/cancel",
        when: "in-wizard cancel placement wins",
        note: "TODO(open-decision): cancel placement \u2014 in-wizard vs an out-of-wizard pending-orders surface (FE doc open questions 1+2). Per-rail cancel eligibility is contract OQ7."
      }
    ],
    mayReturn: ["ORDER/CREATED"],
    terminal: false,
    notes: [
      "No instructions re-issue endpoint exists; expired-instructions recovery is unenumerated. TODO(open-decision): contract OQ7.",
      "Async instructions (PREPARING) are deliberately not in v1 \u2014 Transak returns bank details synchronously."
    ]
  },
  "ORDER/AWAITING_CONFIRMATION": {
    key: "ORDER/AWAITING_CONFIRMATION",
    kind: "ORDER",
    phase: "AWAITING_CONFIRMATION",
    screens: [4],
    docStatus: "SPECIFIED",
    allowedTransitions: [{ id: "confirm", mode: "SUBMIT", endpoint: "POST /fiat/orders" }],
    mayReturn: [
      "PAYMENT/CAPTURE",
      "PAYMENT/INSTRUCT",
      "ORDER/CREATED",
      "QUOTE",
      "PENDING_ORDER"
    ],
    terminal: false,
    notes: [
      "Bank rails only \u2014 card rails skip it, the pay sheet was the confirmation.",
      "Carries a refreshed quote: the price may have drifted during KYC."
    ]
  },
  "ORDER/CREATED": {
    key: "ORDER/CREATED",
    kind: "ORDER",
    phase: "CREATED",
    screens: [7, 13, 14, 15],
    docStatus: "SPECIFIED",
    allowedTransitions: [
      {
        id: "poll",
        mode: "AWAIT",
        endpoint: "GET /fiat/orders/:id",
        when: "status is non-terminal and the request carried no destinationAsset",
        note: "For older clients only: an order whose request carried a destinationAsset offers delivery instead. Documented giveUpAfterMs 300000 \u2014 on give-up the wizard exits and the durable order takes over."
      },
      {
        id: "delivery",
        mode: "AWAIT",
        endpoint: "GET /fiat/delivery/:deliveryId",
        when: "the request carried a destinationAsset: offered from creation, in every status",
        note: "The backend decides; the client never infers it. It follows this transition when offered and then polls only GET /fiat/delivery/:deliveryId, which reports both the fiat leg and any conversion after it. Without it the client polls the order and treats SETTLED as done. giveUpAfterMs is the time left in the one delivery polling window, which starts at the order's creation (15 minutes); see DELIVERY:PENDING."
      },
      {
        id: "retry_payment",
        mode: "SUBMIT",
        endpoint: "POST /fiat/orders",
        when: "failureReason.recovery === RETRY_PAYMENT"
      },
      {
        id: "requote",
        mode: "SUBMIT",
        endpoint: "POST /fiat/quote",
        when: "failureReason.recovery === REQUOTE"
      },
      {
        id: "cancel",
        mode: "SUBMIT",
        endpoint: "POST /fiat/orders/:id/cancel",
        when: "in-wizard cancel placement wins and the rail allows it",
        note: "TODO(open-decision): cancel placement (FE doc open questions 1+2); per-rail eligibility is contract OQ7."
      }
    ],
    mayReturn: ["ORDER/CREATED", "DELIVERY:PENDING", "DELIVERY:SUCCEEDED", "DELIVERY:FAILED"],
    terminal: false,
    terminalStatuses: TERMINAL_ORDER_STATUSES,
    notes: [
      "Flow-terminality here rides status \u2208 terminalStatuses, not the state kind and not array emptiness.",
      "A terminal status may still carry a recovery transition: FAILED + retryable failureReason emits it (FE doc Screen 14); non-retryable emits [].",
      "ON_HOLD is a non-terminal status (resolves to PROCESSING or REFUNDED) \u2014 and is NOT the same thing as the KYC ON_HOLD reason; see the note on that field.",
      "CAPTURE_ORPHANED is non-terminal pending the backend rank map (added from review 2026-08-14).",
      "SETTLED is terminal for the order. For a request that carried a destinationAsset the purchase is read from DELIVERY (GET /fiat/delivery/:deliveryId) from creation, so the client never polls the order. The order body itself never describes the conversion.",
      "TODO(open-decision): contract OQ7 \u2014 under/over-payment is the biggest unenumerated branch."
    ]
  },
  "DELIVERY:PENDING": {
    key: "DELIVERY:PENDING",
    kind: "DELIVERY",
    state: "PENDING",
    screens: [7],
    docStatus: "SPECIFIED",
    allowedTransitions: [
      {
        id: "poll",
        mode: "AWAIT",
        endpoint: "GET /fiat/delivery/:deliveryId",
        note: "Every answer carries giveUpAfterMs: the time left in one polling window that starts at the order's creation (15 minutes), so the window never restarts. When it runs out the client closes the wizard and relies on the notification at the end of the purchase. Giving up the poll does not fail the purchase: the backend still finishes the delivery or raises it to support."
      }
    ],
    mayReturn: ["DELIVERY:PENDING", "DELIVERY:SUCCEEDED", "DELIVERY:FAILED"],
    terminal: false,
    notes: [
      "Covers both legs: the fiat order is not terminal yet, or it settled and a crypto asset provider is converting it into the destinationAsset and paying the user. The client shows one waiting screen.",
      "No cancel here. TODO(open-decision): cancel placement (FE doc open questions 1+2)."
    ]
  },
  "DELIVERY:SUCCEEDED": {
    key: "DELIVERY:SUCCEEDED",
    kind: "DELIVERY",
    state: "SUCCEEDED",
    screens: [13],
    docStatus: "SPECIFIED",
    allowedTransitions: [],
    mayReturn: [],
    terminal: true,
    notes: [
      "The destinationAsset reached the user. txHash is the transaction that paid them: the fiat order payout on a direct delivery, the conversion payout on a converted one."
    ]
  },
  "DELIVERY:FAILED": {
    key: "DELIVERY:FAILED",
    kind: "DELIVERY",
    state: "FAILED",
    screens: [],
    docStatus: "SPECIFIED",
    allowedTransitions: [],
    mayReturn: [],
    terminal: true,
    notes: [
      "FAILED covers both legs: the fiat order failed, was refunded, expired or was cancelled, or the buyer paid and the asset did not arrive. The state carries no reason field.",
      "FAILED offers no transition: the client shows the failure screen and offers no new payment from it. When the buyer paid, support recovers the funds."
    ]
  }
};
var STATE_KEYS = Object.keys(TRANSITION_TABLE);
var DOCUMENTED_ENDPOINTS = [
  "GET /fiat/payment-methods",
  "POST /fiat/quote",
  "POST /fiat/auth",
  "POST /fiat/auth/verify",
  "POST /fiat/auth/refresh",
  "POST /fiat/auth/revoke",
  "POST /fiat/payment-session",
  "POST /fiat/session",
  "POST /fiat/session/verify",
  "GET /fiat/quotes/:quoteRef",
  "POST /fiat/kyc/form",
  "POST /fiat/kyc/capture",
  "POST /fiat/kyc/sdk-token",
  "POST /fiat/kyc/document",
  "POST /fiat/instruments",
  "POST /fiat/orders",
  "GET /fiat/orders/:id",
  "GET /fiat/delivery/:deliveryId",
  "GET /fiat/orders/:id/instructions",
  "POST /fiat/orders/:id/confirm-payment",
  "POST /fiat/orders/:id/reference",
  "POST /fiat/orders/:id/cancel",
  "POST /fiat/orders/:id/surface-result"
];
var UNOFFERED_ENDPOINTS = [
  {
    endpoint: "GET /fiat/payment-methods",
    reason: "Discovery, called before any flow state exists \u2014 there is no state to hang it off."
  },
  {
    endpoint: "POST /fiat/auth/refresh",
    reason: "SDK session store, not a transition."
  },
  {
    endpoint: "POST /fiat/auth/revoke",
    reason: "SDK session store, not a transition."
  },
  {
    endpoint: "POST /fiat/kyc/document",
    reason: "FILE fields use it for a direct provider/vendor upload handshake and completion report; the harness owns that auxiliary path and it is not a transition (see KYC/INPUT_REQUIRED notes)."
  },
  {
    endpoint: "POST /fiat/instruments",
    reason: "No state offers it and no published doc explains why. TODO(open-decision): saved instruments may simply be unreached in v1 \u2014 confirm, or wire it to the state that should offer it."
  },
  {
    endpoint: "GET /fiat/orders/:id/instructions",
    reason: "PAYMENT{INSTRUCT} carries its instructions in state and offers no fetch. TODO(open-decision): that state also notes no re-issue endpoint exists, which sits oddly beside this one being published \u2014 confirm or retire it."
  },
  {
    endpoint: "POST /fiat/orders/:id/reference",
    reason: "The bank-reference submission is offered by no state. TODO(open-decision): PAYMENT{INSTRUCT} is the plausible home \u2014 confirm or wire it."
  }
];
var UNREACHABLE_STATES = [
  {
    stateKey: "FUN_AUTH",
    reason: "Answered to the entry quote request of a Fun-run login with no session, before any state exists; no state returns it."
  }
];
function unofferedEndpoints() {
  const offered = /* @__PURE__ */ new Set();
  for (const key of STATE_KEYS) {
    for (const allowed of TRANSITION_TABLE[key].allowedTransitions) offered.add(allowed.endpoint);
  }
  return DOCUMENTED_ENDPOINTS.filter((endpoint) => !offered.has(endpoint));
}
function unreachableStates(from = "QUOTE") {
  const seen = /* @__PURE__ */ new Set([from]);
  const queue = [from];
  while (queue.length > 0) {
    for (const target of TRANSITION_TABLE[queue.pop()].mayReturn ?? []) {
      if (!seen.has(target)) {
        seen.add(target);
        queue.push(target);
      }
    }
  }
  return STATE_KEYS.filter((key) => !seen.has(key));
}
function stateKey(state) {
  switch (state.kind) {
    case "QUOTE":
      return "QUOTE";
    case "FUN_AUTH":
      return "FUN_AUTH";
    case "SESSION_AUTH":
      return "SESSION_AUTH";
    case "PENDING_ORDER":
      return "PENDING_ORDER";
    case "BLOCKED":
      return "BLOCKED";
    case "KYC": {
      if (state.phase === "CAPTURE") return "KYC/CAPTURE";
      if (state.phase === "INPUT_REQUIRED") return "KYC/INPUT_REQUIRED";
      return `KYC/NO_ACTION_REQUIRED:${state.reason}`;
    }
    case "PAYMENT":
      return state.phase === "CAPTURE" ? "PAYMENT/CAPTURE" : "PAYMENT/INSTRUCT";
    case "ORDER":
      return state.phase === "AWAITING_CONFIRMATION" ? "ORDER/AWAITING_CONFIRMATION" : "ORDER/CREATED";
    case "DELIVERY":
      return `DELIVERY:${state.state}`;
    default: {
      const exhaustive = state;
      throw new Error(`unknown FlowState: ${JSON.stringify(exhaustive)}`);
    }
  }
}
var tableEntry = (state) => TRANSITION_TABLE[stateKey(state)];
function isTerminal(state) {
  const entry = tableEntry(state);
  if (entry.terminalStatuses && state.kind === "ORDER" && state.phase === "CREATED") {
    return entry.terminalStatuses.includes(state.status);
  }
  return entry.terminal;
}
