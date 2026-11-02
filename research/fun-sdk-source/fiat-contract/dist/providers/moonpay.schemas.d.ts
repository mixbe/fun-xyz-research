/**
 * zod schemas for the MoonPay flow on `POST /fiat/next`. Test-time and backend-boundary only:
 * exported from the package root, never from `./moonpay`, so the production entry stays free of zod.
 */
import { z } from 'zod';
import type { MoonPayCaptureDocument, MoonPayCaptureNextAction, MoonPayCaptureRequest, MoonPayCheckout, MoonPayConnectNextAction, MoonPayConnectRequest, MoonPayConsentNextAction, MoonPayConsentRequest, MoonPayDeclineRequest, MoonPayDone, MoonPayErrorBody, MoonPayFault, MoonPayGuestDeclineReason, MoonPayKycNextAction, MoonPayKycRequest, MoonPayNextRequest, MoonPayObserveRequest, MoonPayOrderNextAction, MoonPayOrderPendingNextAction, MoonPayOrderRequest, MoonPayOrderResponse, MoonPayPayNextAction, MoonPayPhoneCodeNextAction, MoonPayPhoneCodeRequest, MoonPayPhoneNextAction, MoonPayPhoneRequest, MoonPayPrepareCaptureNextAction, MoonPayPrepareCaptureRequest, MoonPayReask, MoonPayReaskReason, MoonPayReaskRequirement, MoonPayNextAction, MoonPayQuoteInput, MoonPayRequest, MoonPayRequestContext, MoonPayResponseFor, MoonPaySdkCredentials, MoonPaySessionNextAction, MoonPaySessionRequest, MoonPayStepResponse, MoonPayWaitNextAction } from './moonpay';
export declare const MoonPayCheckoutSchema: z.ZodType<MoonPayCheckout>;
export declare const MoonPaySdkCredentialsSchema: z.ZodType<MoonPaySdkCredentials>;
export declare const MoonPayRequestContextSchema: z.ZodType<MoonPayRequestContext>;
export declare const MoonPayQuoteInputSchema: z.ZodType<MoonPayQuoteInput>;
export declare const MoonPayGuestDeclineReasonSchema: z.ZodType<MoonPayGuestDeclineReason>;
export declare const MoonPayObserveRequestSchema: z.ZodType<MoonPayRequestContext & MoonPayObserveRequest>;
export declare const MoonPayConsentRequestSchema: z.ZodType<MoonPayRequestContext & MoonPayConsentRequest>;
export declare const MoonPaySessionRequestSchema: z.ZodType<MoonPayRequestContext & MoonPaySessionRequest>;
export declare const MoonPayConnectRequestSchema: z.ZodType<MoonPayRequestContext & MoonPayConnectRequest>;
export declare const MoonPayPhoneRequestSchema: z.ZodType<MoonPayRequestContext & MoonPayPhoneRequest>;
export declare const MoonPayPhoneCodeRequestSchema: z.ZodType<MoonPayRequestContext & MoonPayPhoneCodeRequest>;
export declare const MoonPayDeclineRequestSchema: z.ZodType<MoonPayRequestContext & MoonPayDeclineRequest>;
export declare const MoonPayKycRequestSchema: z.ZodType<MoonPayRequestContext & MoonPayKycRequest>;
export declare const MoonPayPrepareCaptureRequestSchema: z.ZodType<MoonPayRequestContext & MoonPayPrepareCaptureRequest>;
export declare const MoonPayCaptureRequestSchema: z.ZodType<MoonPayRequestContext & MoonPayCaptureRequest>;
export declare const MoonPayOrderRequestSchema: z.ZodType<MoonPayRequestContext & MoonPayOrderRequest>;
export declare const MoonPayRequestSchema: z.ZodType<MoonPayRequest>;
export declare const MoonPayNextRequestSchema: z.ZodType<MoonPayNextRequest>;
export declare const MoonPayConsentNextActionSchema: z.ZodType<MoonPayConsentNextAction>;
export declare const MoonPaySessionNextActionSchema: z.ZodType<MoonPaySessionNextAction>;
export declare const MoonPayConnectNextActionSchema: z.ZodType<MoonPayConnectNextAction>;
export declare const MoonPayPhoneNextActionSchema: z.ZodType<MoonPayPhoneNextAction>;
export declare const MoonPayPhoneCodeNextActionSchema: z.ZodType<MoonPayPhoneCodeNextAction>;
export declare const MoonPayPayNextActionSchema: z.ZodType<MoonPayPayNextAction>;
export declare const MoonPayKycNextActionSchema: z.ZodType<MoonPayKycNextAction>;
export declare const MoonPayPrepareCaptureNextActionSchema: z.ZodType<MoonPayPrepareCaptureNextAction>;
export declare const MoonPayCaptureDocumentSchema: z.ZodType<MoonPayCaptureDocument>;
export declare const MoonPayReaskRequirementSchema: z.ZodType<MoonPayReaskRequirement>;
export declare const MoonPayReaskReasonSchema: z.ZodType<MoonPayReaskReason>;
export declare const MoonPayReaskSchema: z.ZodType<MoonPayReask>;
export declare const MoonPayCaptureNextActionSchema: z.ZodType<MoonPayCaptureNextAction>;
export declare const MoonPayWaitNextActionSchema: z.ZodType<MoonPayWaitNextAction>;
export declare const MoonPayOrderNextActionSchema: z.ZodType<MoonPayOrderNextAction>;
export declare const MoonPayOrderPendingNextActionSchema: z.ZodType<MoonPayOrderPendingNextAction>;
export declare const MoonPayNextActionSchema: z.ZodType<MoonPayNextAction>;
export declare const MoonPayDoneSchema: z.ZodType<MoonPayDone>;
export declare const MoonPayStepResponseSchema: z.ZodType<MoonPayStepResponse>;
export declare const MoonPayOrderResponseSchema: z.ZodType<MoonPayOrderResponse>;
/** The response schema for each request action, as `MoonPayResponseFor` types it. */
export declare const MoonPayResponseSchemaFor: {
    readonly [A in keyof MoonPayResponseFor]: z.ZodType<MoonPayResponseFor[A]>;
};
export declare const MoonPayFaultSchema: z.ZodType<MoonPayFault>;
export declare const MoonPayErrorBodySchema: z.ZodType<MoonPayErrorBody>;
