/**
 * Set (or reset) the owner dashboard password.
 *
 *   npm run admin:set-password -- owner@yourdomain.com
 *
 * Prompts for the new password (hidden). Uses DATABASE_URL if set (Postgres),
 * otherwise the local SQLite database. Creates the admin account if the email
 * doesn't exist yet, and signs out that admin's existing sessions.
 */
import readline from "node:readline";
import { setAdminPassword } from "../src/lib/db";

function promptHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const mutable = rl as unknown as { _writeToOutput: (s: string) => void; output: NodeJS.WriteStream };
    let muted = false;
    mutable._writeToOutput = (s: string) => {
      if (!muted || s.includes("\n")) mutable.output.write(muted ? "\n" : s);
    };
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
    muted = true;
  });
}

async function main() {
  const email = (process.argv[2] || "").trim();
  if (!email || !email.includes("@")) {
    console.error("Usage: npm run admin:set-password -- <owner-email>");
    process.exit(1);
  }

  const password = process.env.ADMIN_NEW_PASSWORD || (await promptHidden("New password (min 10 chars): "));
  if (password.length < 10) {
    console.error("Password must be at least 10 characters.");
    process.exit(1);
  }
  if (!process.env.ADMIN_NEW_PASSWORD) {
    const confirm = await promptHidden("Repeat password: ");
    if (confirm !== password) {
      console.error("Passwords do not match.");
      process.exit(1);
    }
  }

  const result = await setAdminPassword(email, password);
  console.log(result === "created" ? `Created owner account ${email}.` : `Password updated for ${email}.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to set password:", err instanceof Error ? err.message : err);
  process.exit(1);
});
