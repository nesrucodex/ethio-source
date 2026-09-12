import { generateKeyPairSync } from "node:crypto";

// Run after `bun run backend`. Secrets never appear in terminal output.
for (const name of ["JWT_PRIVATE_KEY", "JWKS"]) {
  const result = Bun.spawnSync(
    ["bunx", "--bun", "convex", "env", "get", name],
    { stdout: "pipe", stderr: "pipe" },
  );
  if (result.exitCode === 0 && result.stdout.toString().trim()) {
    throw new Error(
      "Authentication keys already exist. Keep the existing pair; this script will not rotate keys.",
    );
  }
}
const pair = generateKeyPairSync("rsa", { modulusLength: 2048 });
const privateKey = pair.privateKey
  .export({ type: "pkcs8", format: "pem" })
  .toString()
  .trimEnd()
  .replace(/\n/g, " ");
const publicKey = pair.publicKey.export({ format: "jwk" });
for (const [name, value] of Object.entries({
  JWT_PRIVATE_KEY: privateKey,
  JWKS: JSON.stringify({ keys: [{ use: "sig", ...publicKey }] }),
})) {
  const result = Bun.spawnSync(
    ["bunx", "--bun", "convex", "env", "set", "--", name, value],
    { stdout: "pipe", stderr: "pipe" },
  );
  if (result.exitCode !== 0)
    throw new Error(
      `Could not configure ${name}. Check the running deployment.`,
    );
}
console.log("Authentication signing keys configured.");
