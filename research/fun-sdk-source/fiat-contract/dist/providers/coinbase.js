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

// src/providers/coinbase.ts
var coinbase_exports = {};
__export(coinbase_exports, {
  COINBASE_ENDPOINTS: () => COINBASE_ENDPOINTS,
  COINBASE_TERMS: () => COINBASE_TERMS
});
module.exports = __toCommonJS(coinbase_exports);
var COINBASE_ENDPOINTS = {
  next: "POST /fiat/next"
};
var COINBASE_TERMS = {
  id: "COINBASE_TERMS",
  kind: "PROVIDER_TERMS",
  stage: "CHECKOUT",
  version: "2026-01",
  contentDigest: "22db1a8292d9ecd60b53adf640c8748ad8477646c26a31971a83f7a43457f1fe",
  links: [{ label: "Coinbase User Agreement", url: "https://www.coinbase.com/legal/user_agreement" }]
};
