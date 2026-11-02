// src/routing.ts
var ROUTING_ENDPOINTS = {
  table: "POST /fiat/routing/table",
  /** Temporary: `POST /fiat/next` replaces it for each provider that moves there. */
  quote: "POST /fiat/routing/quote"
};

export {
  ROUTING_ENDPOINTS
};
