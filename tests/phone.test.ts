import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeIndianMobile } from "../src/lib/phone.ts";

test("accepts Indian mobile numbers in the usual formats", () => {
  for (const ok of ["9876543210", "98765 43210", "+91 98765 43210", "919876543210", "09876543210"]) {
    assert.equal(normalizeIndianMobile(ok), "9876543210", ok);
  }
});

test("rejects anything that can't be an Indian mobile number", () => {
  for (const bad of ["123", "", null, undefined, "1234567890", "98765432101234", "abcdefghij"]) {
    assert.equal(normalizeIndianMobile(bad), null, String(bad));
  }
});
