// Convex injects the matching database URL into the Next.js build.
export {};

const key = process.env.CONVEX_DEPLOY_KEY;
if (!key) {
  throw new Error("Set CONVEX_DEPLOY_KEY in the deployment environment.");
}
if (process.env.VERCEL_ENV === "production" && !key.startsWith("prod:")) {
  throw new Error("Vercel Production requires a Convex production deploy key.");
}
if (process.env.VERCEL_ENV === "preview" && key.startsWith("prod:")) {
  throw new Error(
    "Use a separate Convex development or preview key for Vercel Preview.",
  );
}
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
if (!siteUrl || new URL(siteUrl).protocol !== "https:") {
  throw new Error(
    "Set NEXT_PUBLIC_SITE_URL to the HTTPS storefront URL before deploying.",
  );
}
const child = Bun.spawn(
  [
    "bunx",
    "--bun",
    "convex",
    "deploy",
    "--cmd",
    "bun run build",
    "--cmd-url-env-var-name",
    "NEXT_PUBLIC_CONVEX_URL",
  ],
  { stdin: "inherit", stdout: "inherit", stderr: "inherit" },
);
process.exit(await child.exited);
