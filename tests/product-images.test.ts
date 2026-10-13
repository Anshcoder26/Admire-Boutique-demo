import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  decodePhotoDataUrl,
  parsePhotoFile,
  photoVersion,
  toPublicImages,
} from "../src/lib/product-images.ts";

const jpegBytes = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);
const jpegDataUrl = `data:image/jpeg;base64,${jpegBytes.toString("base64")}`;

test("stored photos become short links; normal URLs are kept", () => {
  const images = toPublicImages("prod 1", [jpegDataUrl, "https://images.unsplash.com/x.jpg"]);
  assert.equal(images[0], `/api/products/prod%201/images/0-${photoVersion(jpegDataUrl)}`);
  assert.equal(images[1], "https://images.unsplash.com/x.jpg");
  assert.ok(images[0].length < 60);
});

test("the inline marker from the database gives the same link as the photo itself", () => {
  const md5 = createHash("md5").update(jpegDataUrl).digest("hex");
  assert.deepEqual(toPublicImages("p", [`inline:${md5}`]), toPublicImages("p", [jpegDataUrl]));
});

test("a changed photo gets a different link", () => {
  const other = `data:image/jpeg;base64,${Buffer.from([0xff, 0xd8, 9]).toString("base64")}`;
  assert.notEqual(toPublicImages("p", [jpegDataUrl])[0], toPublicImages("p", [other])[0]);
});

test("photo file names are parsed strictly", () => {
  assert.deepEqual(parsePhotoFile("2-abc123"), { index: 2, version: "abc123" });
  assert.deepEqual(parsePhotoFile("0"), { index: 0, version: undefined });
  assert.equal(parsePhotoFile("-1"), null);
  assert.equal(parsePhotoFile("1-../../x"), null);
  assert.equal(parsePhotoFile("abc"), null);
});

test("data URLs decode to bytes; non-image types are refused", () => {
  const decoded = decodePhotoDataUrl(jpegDataUrl);
  assert.equal(decoded?.contentType, "image/jpeg");
  assert.deepEqual(decoded?.body, jpegBytes);
  const html = `data:text/html;base64,${Buffer.from("<script>alert(1)</script>").toString("base64")}`;
  assert.equal(decodePhotoDataUrl(html), null);
  const svg = `data:image/svg+xml;base64,${Buffer.from("<svg/>").toString("base64")}`;
  assert.equal(decodePhotoDataUrl(svg), null);
  assert.equal(decodePhotoDataUrl("https://example.com/a.jpg"), null);
});
