/**
 * zod schemas for the Coinbase flow on `POST /fiat/next`. Test-time and backend-boundary only:
 * exported from the package root, never from `./coinbase`, so the production entry stays free of zod.
 */
import { z } from 'zod';
import type { CoinbaseCheckout, CoinbaseConsentNextAction, CoinbaseConsentRequest, CoinbaseDone, CoinbaseErrorBody, CoinbaseFault, CoinbaseKycNextAction, CoinbaseKycRequest, CoinbaseNextAction, CoinbaseNextRequest, CoinbaseObserveRequest, CoinbaseOrderPendingNextAction, CoinbaseOrderRequest, CoinbaseOrderResponse, CoinbaseOtpNextAction, CoinbaseOtpRequest, CoinbasePayNextAction, CoinbasePlaceOrderNextAction, CoinbasePlaceOrderRequest, CoinbasePrice, CoinbaseReask, CoinbaseRefused, CoinbaseRequest, CoinbaseRequestContext, CoinbaseResponseFor, CoinbaseSessionNextAction, CoinbaseSessionRequest, CoinbaseStepResponse, CoinbaseWaitNextAction } from './coinbase';
export declare const CoinbaseCheckoutSchema: z.ZodType<CoinbaseCheckout>;
export declare const CoinbaseRequestContextSchema: z.ZodType<CoinbaseRequestContext>;
export declare const CoinbaseObserveRequestSchema: z.ZodType<CoinbaseRequestContext & CoinbaseObserveRequest>;
export declare const CoinbaseConsentRequestSchema: z.ZodType<CoinbaseRequestContext & CoinbaseConsentRequest>;
export declare const CoinbaseSessionRequestSchema: z.ZodType<CoinbaseRequestContext & CoinbaseSessionRequest>;
export declare const CoinbaseOtpRequestSchema: z.ZodType<CoinbaseRequestContext & CoinbaseOtpRequest>;
export declare const CoinbaseKycRequestSchema: z.ZodType<CoinbaseRequestContext & CoinbaseKycRequest>;
export declare const CoinbasePlaceOrderRequestSchema: z.ZodType<CoinbaseRequestContext & CoinbasePlaceOrderRequest>;
export declare const CoinbaseOrderRequestSchema: z.ZodType<CoinbaseRequestContext & CoinbaseOrderRequest>;
export declare const CoinbaseRequestSchema: z.ZodType<CoinbaseRequest>;
export declare const CoinbaseNextRequestSchema: z.ZodType<CoinbaseNextRequest>;
export declare const CoinbasePriceSchema: z.ZodType<CoinbasePrice>;
export declare const CoinbaseReaskSchema: z.ZodType<CoinbaseReask>;
export declare const CoinbaseConsentNextActionSchema: z.ZodType<CoinbaseConsentNextAction>;
export declare const CoinbaseSessionNextActionSchema: z.ZodType<CoinbaseSessionNextAction>;
export declare const CoinbaseOtpNextActionSchema: z.ZodType<CoinbaseOtpNextAction>;
export declare const CoinbaseKycNextActionSchema: z.ZodType<CoinbaseKycNextAction>;
export declare const CoinbaseWaitNextActionSchema: z.ZodType<CoinbaseWaitNextAction>;
export declare const CoinbasePlaceOrderNextActionSchema: z.ZodType<CoinbasePlaceOrderNextAction>;
export declare const CoinbasePayNextActionSchema: z.ZodType<CoinbasePayNextAction>;
export declare const CoinbaseOrderPendingNextActionSchema: z.ZodType<CoinbaseOrderPendingNextAction>;
export declare const CoinbaseNextActionSchema: z.ZodType<CoinbaseNextAction>;
export declare const CoinbaseDoneSchema: z.ZodType<CoinbaseDone>;
export declare const CoinbaseRefusedSchema: z.ZodType<CoinbaseRefused>;
export declare const CoinbaseStepResponseSchema: z.ZodType<CoinbaseStepResponse>;
export declare const CoinbaseOrderResponseSchema: z.ZodType<CoinbaseOrderResponse>;
/** The response schema for each request action, as `CoinbaseResponseFor` types it. */
export declare const CoinbaseResponseSchemaFor: {
    readonly [A in keyof CoinbaseResponseFor]: z.ZodType<CoinbaseResponseFor[A]>;
};
export declare const CoinbaseFaultSchema: z.ZodType<CoinbaseFault>;
export declare const CoinbaseErrorBodySchema: z.ZodType<CoinbaseErrorBody>;
