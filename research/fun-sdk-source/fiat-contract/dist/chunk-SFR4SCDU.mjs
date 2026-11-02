// src/providers/coinbase.ts
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

export {
  COINBASE_ENDPOINTS,
  COINBASE_TERMS
};
