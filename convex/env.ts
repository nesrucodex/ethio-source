import { z } from "zod";
export function paymentEnv() {
  return z
    .object({
      CHAPA_SECRET_KEY: z.string().min(1),
      CHAPA_WEBHOOK_SECRET: z.string().min(1),
      SITE_URL: z.url(),
      CONVEX_SITE_URL: z.url(),
      CHAPA_MODE: z.enum(["test", "live"]).default("test"),
    })
    .parse({
      CHAPA_SECRET_KEY: process.env.CHAPA_SECRET_KEY,
      CHAPA_WEBHOOK_SECRET: process.env.CHAPA_WEBHOOK_SECRET,
      SITE_URL: process.env.SITE_URL,
      CONVEX_SITE_URL: process.env.CONVEX_SITE_URL,
      CHAPA_MODE: process.env.CHAPA_MODE,
    });
}
