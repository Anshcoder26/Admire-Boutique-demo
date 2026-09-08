import { test } from "node:test";
import assert from "node:assert/strict";
import { checkOrigin } from "../src/lib/csrf.ts";

test("non-mutating methods are always allowed", () => {
  assert.equal(
    checkOrigin({ method: "GET", host: "site.com", origin: "https://evil.com", referer: null }),
    "allow",
  );
});

test("same-origin mutation is allowed", () => {
  assert.equal(
    checkOrigin({ method: "POST", host: "site.com", origin: "https://site.com", referer: null }),
    "allow",
  );
});

test("cross-origin mutation is rejected", () => {
  assert.equal(
    checkOrigin({ method: "POST", host: "site.com", origin: "https://evil.com", referer: null }),
    "reject",
  );
});

test("missing origin and referer is allowed (non-browser client)", () => {
  assert.equal(
    checkOrigin({ method: "POST", host: "site.com", origin: null, referer: null }),
    "allow",
  );
});

test("malformed origin is rejected", () => {
  assert.equal(
    checkOrigin({ method: "DELETE", host: "site.com", origin: "not-a-url", referer: null }),
    "reject",
  );
});

test("referer is used when origin absent", () => {
  assert.equal(
    checkOrigin({ method: "PUT", host: "site.com", origin: null, referer: "https://site.com/page" }),
    "allow",
  );
});

test("configured app URL host is allow-listed", () => {
  assert.equal(
    checkOrigin({
      method: "POST",
      host: "internal-host",
      origin: "https://app.example.com",
      referer: null,
      appUrl: "https://app.example.com",
    }),
    "allow",
  );
});
