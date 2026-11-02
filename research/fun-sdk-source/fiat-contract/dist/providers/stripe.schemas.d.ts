/**
 * zod schemas for the Stripe flow on `POST /fiat/next`. Test-time and backend-boundary only:
 * exported from the package root, never from `./stripe`, so the production entry stays free of zod.
 */
import { z } from 'zod';
import type { StripeAuthorizeNextAction, StripeAuthorizeRequest, StripeCheckout, StripeCheckoutRequest, StripeCheckoutResponse, StripeCheckoutSecretNextAction, StripeConsentNextAction, StripeConsentRequest, StripeDone, StripeErrorBody, StripeFault, StripeKycNextAction, StripeKycRequest, StripeLinkAuthToken, StripeNextAction, StripeNextRequest, StripeObserveRequest, StripeOrderPendingNextAction, StripeOrderRequest, StripeOrderResponse, StripePayNextAction, StripePaySheet, StripePlaceOrderNextAction, StripePlaceOrderRequest, StripePrice, StripeReask, StripeRefused, StripeRequest, StripeRequestContext, StripeResponseFor, StripeSessionNextAction, StripeSessionRequest, StripeStepResponse, StripeVerifyIdentityNextAction, StripeWaitNextAction } from './stripe';
export declare const StripeCheckoutSchema: z.ZodType<StripeCheckout>;
export declare const StripeRequestContextSchema: z.ZodType<StripeRequestContext>;
export declare const StripeObserveRequestSchema: z.ZodType<StripeRequestContext & StripeObserveRequest>;
export declare const StripeConsentRequestSchema: z.ZodType<StripeRequestContext & StripeConsentRequest>;
export declare const StripeSessionRequestSchema: z.ZodType<StripeRequestContext & StripeSessionRequest>;
export declare const StripeAuthorizeRequestSchema: z.ZodType<StripeRequestContext & StripeAuthorizeRequest>;
export declare const StripeKycRequestSchema: z.ZodType<StripeRequestContext & StripeKycRequest>;
export declare const StripePlaceOrderRequestSchema: z.ZodType<StripeRequestContext & StripePlaceOrderRequest>;
export declare const StripeCheckoutRequestSchema: z.ZodType<StripeRequestContext & StripeCheckoutRequest>;
export declare const StripeOrderRequestSchema: z.ZodType<StripeRequestContext & StripeOrderRequest>;
export declare const StripeRequestSchema: z.ZodType<StripeRequest>;
export declare const StripeNextRequestSchema: z.ZodType<StripeNextRequest>;
export declare const StripePriceSchema: z.ZodType<StripePrice>;
export declare const StripePaySheetSchema: z.ZodType<StripePaySheet>;
export declare const StripeLinkAuthTokenSchema: z.ZodType<StripeLinkAuthToken>;
export declare const StripeReaskSchema: z.ZodType<StripeReask>;
export declare const StripeConsentNextActionSchema: z.ZodType<StripeConsentNextAction>;
export declare const StripeSessionNextActionSchema: z.ZodType<StripeSessionNextAction>;
export declare const StripeAuthorizeNextActionSchema: z.ZodType<StripeAuthorizeNextAction>;
export declare const StripeKycNextActionSchema: z.ZodType<StripeKycNextAction>;
export declare const StripeVerifyIdentityNextActionSchema: z.ZodType<StripeVerifyIdentityNextAction>;
export declare const StripeWaitNextActionSchema: z.ZodType<StripeWaitNextAction>;
export declare const StripePlaceOrderNextActionSchema: z.ZodType<StripePlaceOrderNextAction>;
export declare const StripePayNextActionSchema: z.ZodType<StripePayNextAction>;
export declare const StripeCheckoutSecretNextActionSchema: z.ZodType<StripeCheckoutSecretNextAction>;
export declare const StripeOrderPendingNextActionSchema: z.ZodType<StripeOrderPendingNextAction>;
export declare const StripeNextActionSchema: z.ZodType<StripeNextAction>;
export declare const StripeDoneSchema: z.ZodType<StripeDone>;
export declare const StripeRefusedSchema: z.ZodType<StripeRefused>;
export declare const StripeStepResponseSchema: z.ZodType<StripeStepResponse>;
export declare const StripeCheckoutResponseSchema: z.ZodType<StripeCheckoutResponse>;
export declare const StripeOrderResponseSchema: z.ZodType<StripeOrderResponse>;
/** The response schema for each request action, as `StripeResponseFor` types it. */
export declare const StripeResponseSchemaFor: {
    readonly [A in keyof StripeResponseFor]: z.ZodType<StripeResponseFor[A]>;
};
export declare const StripeFaultSchema: z.ZodType<StripeFault>;
export declare const StripeErrorBodySchema: z.ZodType<StripeErrorBody>;
