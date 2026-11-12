import { test } from "node:test";
import assert from "node:assert/strict";
import { pickCategoryImages } from "../src/lib/category-images";

const cats = [
  { name: "Silk", image: "/stock/silk.jpg" },
  { name: "Khadi", image: "/stock/khadi.jpg" },
  { name: "Georgette", image: "/stock/georgette.jpg" },
];

test("a category shows its newest in-stock product", () => {
  const picked = pickCategoryImages(cats, [
    { category: "Silk", images: ["/p/silk-sold.jpg"], isSoldOut: true },
    { category: "Silk", images: ["/p/silk-new.jpg"], stock: 3 },
    { category: "Silk", images: ["/p/silk-old.jpg"], stock: 3 },
  ]);
  assert.equal(picked.Silk, "/p/silk-new.jpg");
});

test("a category whose products are all sold out still shows its own product", () => {
  const picked = pickCategoryImages(cats, [
    { category: "Silk", images: ["/p/silk-a.jpg"], isSoldOut: true },
    { category: "Khadi", images: ["/p/khadi.jpg"], stock: 0 },
  ]);
  assert.equal(picked.Silk, "/p/silk-a.jpg");
  assert.equal(picked.Khadi, "/p/khadi.jpg");
});

test("empty categories borrow photos no other tile uses", () => {
  const picked = pickCategoryImages(cats, [
    { category: "Silk", images: ["/p/silk-1.jpg"] },
    { category: "Silk", images: ["/p/silk-2.jpg"] },
    { category: "Silk", images: ["/p/silk-3.jpg"] },
  ]);
  assert.equal(picked.Silk, "/p/silk-1.jpg");
  assert.equal(picked.Khadi, "/p/silk-2.jpg");
  assert.equal(picked.Georgette, "/p/silk-3.jpg");
});

test("products sharing one photo don't make two tiles repeat it while others are free", () => {
  const picked = pickCategoryImages(cats, [
    { category: "Silk", images: ["/p/a.jpg"] },
    { category: "Silk", images: ["/p/b.jpg"] },
    { category: "Silk", images: ["/p/b.jpg"] },
    { category: "Silk", images: ["/p/c.jpg"] },
  ]);
  assert.equal(new Set(Object.values(picked)).size, 3, JSON.stringify(picked));
});

test("with fewer spare photos than empty categories, photos are reused rather than placeholders", () => {
  const picked = pickCategoryImages(cats, [{ category: "Silk", images: ["/p/only.jpg"] }]);
  assert.deepEqual(Object.values(picked), ["/p/only.jpg", "/p/only.jpg", "/p/only.jpg"]);
});

test("no product photos at all: placeholders are used", () => {
  const picked = pickCategoryImages(cats, [{ category: "Silk", images: [] }]);
  assert.deepEqual(picked, { Silk: "/stock/silk.jpg", Khadi: "/stock/khadi.jpg", Georgette: "/stock/georgette.jpg" });
});
