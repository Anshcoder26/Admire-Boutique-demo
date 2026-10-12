import { test } from "node:test";
import assert from "node:assert/strict";
import { remainingStock } from "../src/lib/cart-limits.ts";

test("empty cart leaves the full stock available", () => {
  assert.equal(remainingStock([], "prod-1", 5), 5);
});

test("all lines of the same product count against its stock", () => {
  const cart = [
    { productId: "prod-1", quantity: 2 },
    { productId: "prod-1", quantity: 1 },
    { productId: "prod-2", quantity: 4 },
  ];
  assert.equal(remainingStock(cart, "prod-1", 5), 2);
  assert.equal(remainingStock(cart, "prod-2", 4), 0);
});

test("never goes below zero when the cart already exceeds stock", () => {
  assert.equal(remainingStock([{ productId: "prod-1", quantity: 9 }], "prod-1", 3), 0);
});

test("missing or invalid stock means nothing can be added", () => {
  assert.equal(remainingStock([], "prod-1", Number.NaN), 0);
  assert.equal(remainingStock([], "prod-1", 0), 0);
});
