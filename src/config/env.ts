import { z } from "zod";
const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.url().optional(),
);
export const env = z
  .object({
    NEXT_PUBLIC_CONVEX_URL: optionalUrl,
    NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  })
  .parse({
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
  });
