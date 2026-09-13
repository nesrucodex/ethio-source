import { generateKeyPairSync } from "node:crypto";

const deploymentArgs = process.env.CONVEX_ENV_FILE
  ? ["--env-file", process.env.CONVEX_ENV_FILE]
  : [];

// Run after deploying functions. Secrets never appear in terminal output.
for (const name of ["JWT_PRIVATE_KEY", "JWKS"]) {
  const result = Bun.spawnSync(
    ["bunx", "--bun", "convex", "env", "get", name, ...deploymentArgs],
    { stdout: "pipe", stderr: "pipe" },
  );
  if (result.exitCode !== 0) {
    throw new Error(
      "Could not inspect authentication keys. Check deployment access before retrying.",
    );
  }
  if (result.stdout.toString().trim()) {
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
    ["bunx", "--bun", "convex", "env", "set", name, ...deploymentArgs],
    { stdin: Buffer.from(value), stdout: "pipe", stderr: "pipe" },
  );
  if (result.exitCode !== 0)
    throw new Error(
      `Could not configure ${name}. Check the running deployment.`,
    );
}
console.log("Authentication signing keys configured.");
