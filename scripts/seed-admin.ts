import { parseArgs } from "node:util";
import { text, password, isCancel, cancel } from "@clack/prompts";
import { ConvexHttpClient } from "convex/browser";
import { z } from "zod";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

class SeedError extends Error {}

const emailSchema = z.email();
const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    email: { type: "string" },
    name: { type: "string" },
    help: { type: "boolean" },
  },
});
if (values.help) {
  console.log(
    "bun run seed:admin [--email you@example.com] [--name 'Your name']\nPrompts for missing values; passwords are hidden. For automation, set ADMIN_EMAIL, ADMIN_NAME, and ADMIN_PASSWORD. Targets the deployment selected by .env.local.",
  );
  process.exit(0);
}
async function answer(
  value: string | undefined,
  prompt: () => Promise<string | symbol>,
) {
  if (value !== undefined) return value;
  if (!process.stdin.isTTY)
    throw new SeedError(
      "Missing admin details. Run interactively or configure ADMIN_EMAIL / ADMIN_PASSWORD.",
    );
  const result = await prompt();
  if (isCancel(result)) {
    cancel("Admin setup cancelled.");
    process.exit(0);
  }
  return result as string;
}
function run<T>(name: string, args: object): T {
  // Only emails and user IDs reach CLI arguments. Passwords go directly to Convex Auth over HTTP.
  const result = Bun.spawnSync(
    ["bunx", "--bun", "convex", "run", name, JSON.stringify(args)],
    { stdout: "pipe", stderr: "pipe" },
  );
  if (result.exitCode !== 0)
    throw new SeedError(
      `Could not run ${name}. Keep 'bun run backend' running so functions are deployed, and check your Convex CLI access.`,
    );
  const output = result.stdout.toString().trim();
  // The Convex CLI prints no output for a null function result.
  return (output ? JSON.parse(output) : null) as T;
}
async function main() {
  const url = z.url().parse(process.env.NEXT_PUBLIC_CONVEX_URL);
  const parsedUrl = new URL(url);
  if (
    parsedUrl.protocol !== "https:" &&
    !["localhost", "127.0.0.1", "[::1]"].includes(parsedUrl.hostname)
  )
    throw new SeedError(
      "Remote account creation requires an HTTPS Convex URL.",
    );
  console.log(
    `Admin setup for ${process.env.CONVEX_DEPLOYMENT || parsedUrl.host}`,
  );
  const email = (
    await answer(values.email ?? process.env.ADMIN_EMAIL, () =>
      text({
        message: "Admin email",
        validate: (value) =>
          emailSchema.safeParse(value?.trim().toLowerCase()).success
            ? undefined
            : "Enter a valid email address",
      }),
    )
  )
    .trim()
    .toLowerCase();
  emailSchema.parse(email);
  let userId = run<Id<"users"> | null>("users:passwordAccountId", { email });
  if (userId) {
    run("users:grantAdmin", { userId });
    console.log(
      `Admin access enabled for ${email}. Existing password preserved. Sign in at /sign-in.`,
    );
    return;
  }
  const name = (
    await answer(
      values.name ?? process.env.ADMIN_NAME ?? "Store Administrator",
      () => text({ message: "Admin name" }),
    )
  ).trim();
  if (name.length < 2 || name.length > 100)
    throw new SeedError("Name must contain 2–100 characters.");
  const secret = await answer(process.env.ADMIN_PASSWORD, () =>
    password({
      message: "Admin password (at least 10 characters)",
      validate: (value) =>
        value && value.length >= 10 ? undefined : "Use at least 10 characters",
    }),
  );
  if (secret.length < 10)
    throw new SeedError("ADMIN_PASSWORD must contain at least 10 characters.");
  const client = new ConvexHttpClient(url, { logger: false });
  try {
    const result = await client.action(api.auth.signIn, {
      provider: "password",
      params: { flow: "signUp", email, name, password: secret },
    });
    if (!result.tokens)
      throw new SeedError(
        "Account creation did not establish a session. Check Convex Auth configuration.",
      );
    client.setAuth(result.tokens.token);
    const viewer = await client.query(api.users.me, {});
    userId = run<Id<"users"> | null>("users:passwordAccountId", { email });
    if (!viewer || userId !== viewer.id)
      throw new SeedError(
        "The CLI deployment and frontend URL do not match. No administrator role was granted.",
      );
    run("users:grantAdmin", { userId });
    console.log(
      `Admin account ready for ${email}. Sign in at /sign-in, then open /admin.`,
    );
  } finally {
    // Do not leave a seed-script login session active.
    await client.action(api.auth.signOut, {}).catch(() => {});
    client.clearAuth();
  }
}
main().catch((error: unknown) => {
  // Provider failures can include account data. Keep credentials and raw error details out of logs.
  console.error(
    error instanceof SeedError
      ? error.message
      : "Admin setup failed. Check your email/name, use a password of at least 10 characters, and ensure the backend, signing keys, and matching deployment URLs are configured. No existing password is reset by this script.",
  );
  process.exitCode = 1;
});
