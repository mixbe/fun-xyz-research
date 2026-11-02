/** MoonPay guest checkout is a separate provider; it never connects a MoonPay customer. */
import type { FiatGeo } from '../types';
import type { MoonPayRequestContext, MoonPayObserveRequest, MoonPayConsentRequest, MoonPaySessionRequest, MoonPayPhoneRequest, MoonPayPhoneCodeRequest, MoonPayDeclineRequest, MoonPayOrderRequest, MoonPayConsentNextAction, MoonPaySessionNextAction, MoonPayPhoneNextAction, MoonPayPhoneCodeNextAction, MoonPayPayNextAction, MoonPayRefused, MoonPayOrderResponse } from './moonpay';
export type MoonPayGuestRequestContext = Omit<MoonPayRequestContext, 'credentials'>;
export type MoonPayGuestRequest = MoonPayGuestRequestContext & (MoonPayObserveRequest | MoonPayConsentRequest | MoonPaySessionRequest | MoonPayPhoneRequest | MoonPayPhoneCodeRequest | MoonPayDeclineRequest | MoonPayOrderRequest);
export type MoonPayGuestNextRequest = {
    provider: 'MOONPAY_GUEST';
    geo: FiatGeo;
    depositAddress?: string;
} & MoonPayGuestRequest;
export type MoonPayGuestStepResponse = MoonPayConsentNextAction | MoonPaySessionNextAction | MoonPayPhoneNextAction | MoonPayPhoneCodeNextAction | MoonPayPayNextAction | MoonPayRefused<'NOT_ELIGIBLE' | 'FINAL_REJECTION', 'REQUOTE' | 'NONE'>;
export type MoonPayGuestResponse = MoonPayGuestStepResponse | MoonPayOrderResponse;
