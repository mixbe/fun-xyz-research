import { z } from 'zod';
import type { MoonPayGuestRequest, MoonPayGuestNextRequest } from './moonpay-guest';
export declare const MoonPayGuestObserveRequestSchema: z.ZodType<Extract<MoonPayGuestRequest, {
    action: "observe";
}>>;
export declare const MoonPayGuestSessionRequestSchema: z.ZodType<Extract<MoonPayGuestRequest, {
    action: "session";
}>>;
export declare const MoonPayGuestConsentRequestSchema: z.ZodType<Extract<MoonPayGuestRequest, {
    action: "consent";
}>>;
export declare const MoonPayGuestOrderRequestSchema: z.ZodType<Extract<MoonPayGuestRequest, {
    action: "order";
}>>;
export declare const MoonPayGuestPhoneNumberRequestSchema: z.ZodType<Extract<MoonPayGuestRequest, {
    action: "phone";
    phoneNumber: string;
}>>;
export declare const MoonPayGuestPhoneResendRequestSchema: z.ZodType<Extract<MoonPayGuestRequest, {
    action: "phone";
    resend: string;
}>>;
export declare const MoonPayGuestPhoneCodeRequestSchema: z.ZodType<Extract<MoonPayGuestRequest, {
    action: "phoneCode";
}>>;
export declare const MoonPayGuestDeclineRequestSchema: z.ZodType<Extract<MoonPayGuestRequest, {
    action: "decline";
}>>;
export declare const MoonPayGuestPhoneRequestSchema: z.ZodType<Extract<MoonPayGuestRequest, {
    action: "phone";
}>>;
export declare const MoonPayGuestRequestSchema: z.ZodType<MoonPayGuestRequest>;
export declare const MoonPayGuestNextRequestSchema: z.ZodType<MoonPayGuestNextRequest>;
import type { MoonPayGuestStepResponse, MoonPayGuestResponse } from './moonpay-guest';
export declare const MoonPayGuestStepResponseSchema: z.ZodType<MoonPayGuestStepResponse>;
export declare const MoonPayGuestResponseSchema: z.ZodType<MoonPayGuestResponse>;
