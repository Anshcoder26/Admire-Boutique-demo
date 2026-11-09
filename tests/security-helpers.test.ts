import { test } from "node:test";
import assert from "node:assert/strict";
import { safeRedirectPath } from "../src/lib/safe-redirect.ts";
import { toCsvCell } from "../src/lib/csv.ts";

test("redirects stay on this site", () => {
  for (const ok of ["/checkout", "/account/orders?x=1", "/"]) {
    assert.equal(safeRedirectPath(ok), ok);
  }
});

test("redirects to other sites are refused", () => {
  for (const bad of ["https://evil.com", "//evil.com", "/\\evil.com", "/\t/evil.com", "javascript:alert(1)", "evil.com", "", null, undefined]) {
    assert.equal(safeRedirectPath(bad), null, String(bad));
  }
});

test("CSV cells can't run as spreadsheet formulas", () => {
  for (const formula of ["=HYPERLINK(1)", "+1+1", "-1+1", "@SUM(A1)", "\t=1", "\r=1"]) {
    assert.equal(toCsvCell(formula).startsWith(`"'`), true, JSON.stringify(formula));
  }
});

test("CSV cells keep normal text and escape quotes", () => {
  assert.equal(toCsvCell("Asha"), '"Asha"');
  assert.equal(toCsvCell('a"b'), '"a""b"');
  assert.equal(toCsvCell(null), '""');
});
