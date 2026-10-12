import { test } from "node:test";
import assert from "node:assert/strict";
import { MAX_PRODUCT_BODY_BYTES, readProductBody } from "../src/lib/product-body.ts";

const req = (body: string, headers: Record<string, string> = {}) =>
  new Request("http://localhost/api/products", { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body });

test("a normal product body is returned as an object", async () => {
  const result = await readProductBody(req(JSON.stringify({ name: "Suit", price: 999 })));
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.body, { name: "Suit", price: 999 });
});

test("a body larger than the limit gets 413 with a photo message", async () => {
  const result = await readProductBody(req("{}", { "Content-Length": String(MAX_PRODUCT_BODY_BYTES + 1) }));
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.response.status, 413);
    assert.match((await result.response.json()).error, /Photos are too large/);
  }
});

test("a cut-off body (like the 10MB truncation) gets 400, not a crash", async () => {
  const result = await readProductBody(req('{"name":"Suit","images":["data:image/png;base64,AAAA'));
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.response.status, 400);
});

test("JSON that isn't an object is rejected", async () => {
  for (const body of ["null", "[]", '"text"', "42"]) {
    const result = await readProductBody(req(body));
    assert.equal(result.ok, false, body);
  }
});
