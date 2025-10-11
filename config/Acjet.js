import arcjet, { tokenBucket } from "@arcjet/next";

export const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
    tokenBucket({
      mode: "LIVE",
      charecteristics: ["userId"],
      refillRate: 10,
      interval: 20,
      capacity: 20,
    }),
  ],
});
