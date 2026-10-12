import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");

// Boot db.ts against a brand-new SQLite database and report which products it seeded.
function productIdsOnFreshDb(seedDemoData: "true" | "false"): string[] {
  const cwd = mkdtempSync(path.join(tmpdir(), "seed-test-"));
  try {
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      SEED_DEMO_DATA: seedDemoData,
      ADMIN_BOOTSTRAP_PASSWORD: "seed-test-admin-password",
      TSX_TSCONFIG_PATH: path.join(root, "tsconfig.json"),
    };
    delete env.DATABASE_URL;
    const script = `import(${JSON.stringify(path.join(root, "src/lib/db.ts"))}).then(async (db) => { const products = await db.listProducts(); process.stdout.write(JSON.stringify(products.map((p) => p.id))); });`;
    const output = execFileSync(process.execPath, ["--import", pathToFileURL(path.join(root, "node_modules/tsx/dist/loader.mjs")).href, "-e", script], { cwd, env, encoding: "utf8" });
    return JSON.parse(output.trim().split("\n").pop() || "[]");
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}

test("demo products are not seeded when SEED_DEMO_DATA=false (live store)", () => {
  assert.deepEqual(productIdsOnFreshDb("false"), []);
});

test("demo products are seeded when SEED_DEMO_DATA=true (local dev/tests)", () => {
  assert.deepEqual(productIdsOnFreshDb("true").sort(), ["prod-1", "prod-2", "prod-3", "prod-4", "prod-5"]);
});
