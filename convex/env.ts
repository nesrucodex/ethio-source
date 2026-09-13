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
    .parse(process.env);
}
