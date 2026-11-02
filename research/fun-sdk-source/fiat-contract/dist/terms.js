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

// src/terms.ts
var terms_exports = {};
__export(terms_exports, {
  FIAT_TERMS_ENDPOINT: () => FIAT_TERMS_ENDPOINT,
  FUN_KYC_CONSENT_DOCUMENTS: () => FUN_KYC_CONSENT_DOCUMENTS,
  PROVIDER_CHECKOUT_DOCUMENTS: () => PROVIDER_CHECKOUT_DOCUMENTS,
  PROVIDER_KYC_DOCUMENTS: () => PROVIDER_KYC_DOCUMENTS,
  PUBLISHED_TERMS_DOCUMENTS: () => PUBLISHED_TERMS_DOCUMENTS
});
module.exports = __toCommonJS(terms_exports);
var FIAT_TERMS_ENDPOINT = "POST /fiat/terms";
var MOONPAY_TERMS = {
  id: "MOONPAY_TERMS",
  kind: "PROVIDER_TERMS",
  stage: "CHECKOUT",
  version: "moonpay-terms-2026-09",
  contentDigest: "aab09ddd95a6fdd3f7c483e22833375a03c031d7379a3f60e09aa46ab4856d07",
  links: [
    { label: "MoonPay Terms of Use", url: "https://www.moonpay.com/legal/terms" },
    { label: "MoonPay Privacy Policy", url: "https://www.moonpay.com/legal/privacy_policy" }
  ]
};
var MOONPAY_TERMS_KYC_SHARING_V2 = {
  id: "MOONPAY_TERMS",
  kind: "PROVIDER_TERMS",
  stage: "CHECKOUT",
  version: "2026-09-l2-kyc-sharing-v2",
  contentDigest: "44e096af329262134fe6680659c9bd42014cbf5e96f064d67869173a4f7d822b",
  links: [
    { label: "MoonPay Terms of Use", url: "https://www.moonpay.com/legal/terms" },
    { label: "MoonPay Privacy Policy", url: "https://www.moonpay.com/legal/privacy_policy" },
    { label: "Persona Privacy Policy", url: "https://withpersona.com/legal/privacy-policy" }
  ]
};
var MOONPAY_KYC_SHARING = {
  id: "MOONPAY_KYC_SHARING",
  kind: "PROVIDER_KYC_SHARING",
  stage: "KYC",
  version: "2026-09-l2-kyc-sharing-v3",
  contentDigest: "fe587d7c6542a12070444ddb2e6ff0f2f6062b00ffc512cdb5c60438d355088e",
  links: [{ label: "Persona Privacy Policy", url: "https://withpersona.com/legal/privacy-policy" }]
};
var PROVIDER_CHECKOUT_DOCUMENTS = {
  MOONPAY: [MOONPAY_TERMS],
  MOONPAY_GUEST: [MOONPAY_TERMS]
};
var PROVIDER_KYC_DOCUMENTS = {
  MOONPAY: [MOONPAY_KYC_SHARING]
};
var funKycConsent = (contentDigest) => ({
  id: "FUN_KYC_CONSENT",
  kind: "FUN_KYC_COLLECTION",
  stage: "KYC",
  version: "fun-kyc-consent-2026-09-11",
  contentDigest,
  links: [{ label: "Fun.xyz Privacy Policy", url: "https://fun.xyz/privacy" }]
});
var FUN_KYC_CONSENT_DOCUMENTS = {
  en: funKycConsent("da31f2467deb996476b131116508ea2a00220765e658a79abc6d2bd44337504a"),
  es: funKycConsent("73753b70ad8d1b48dfdcda35e6028c3a7ada66c311a67a1d8f6fe13c76a32f3b"),
  fr: funKycConsent("5ee82675984591dbf66337f31246179103c5624a189850943d400f9b85a84965"),
  ja: funKycConsent("3f272da313f66601a20c3ca43c967aff4bb7f73488177f0a4ce94cbc78bafce2"),
  ko: funKycConsent("aab7839bfba3f34aa47ca6b10647c2c8965c37d845494ef8f3067ca3e3821200"),
  ru: funKycConsent("17168083ebcc4fd11ea80b08c3f230bdec03a1e7b89173a38819ae5533b0fc96"),
  tr: funKycConsent("463040c3b58c922ecae2ae8262a78eb732bbcc5606c394723626378b3db2bbc3"),
  zh: funKycConsent("7f76d850adaf69783c5d9365e51abb5446f4e5778c63eabbdb4784d72464f855")
};
var PUBLISHED_TERMS_DOCUMENTS = [
  MOONPAY_TERMS_KYC_SHARING_V2,
  MOONPAY_TERMS,
  MOONPAY_KYC_SHARING,
  ...Object.values(FUN_KYC_CONSENT_DOCUMENTS)
];
