import { z } from "zod";
const initialized = z.object({
  status: z.literal("success"),
  data: z.object({ checkout_url: z.url() }),
});
const verified = z.object({
  status: z.literal("success"),
  data: z.object({
    tx_ref: z.string(),
    amount: z
      .union([z.string(), z.number()])
      .transform(Number)
      .refine(Number.isFinite),
    currency: z.string(),
    status: z.string(),
    mode: z.enum(["test", "live"]),
  }),
});
export class ChapaClient {
  constructor(private readonly secret: string) {}
  private async request(path: string, body?: unknown) {
    const response = await fetch(
      "https://api.chapa.co/v1/transaction/" + path,
      {
        method: body ? "POST" : "GET",
        headers: {
          Authorization: `Bearer ${this.secret}`,
          "Content-Type": "application/json",
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: AbortSignal.timeout(20000),
      },
    );
    if (!response.ok)
      throw new Error("The payment provider is unavailable. Please try again.");
    return response.json();
  }
  async initialize(input: {
    amount: string;
    currency: "ETB";
    email: string;
    first_name: string;
    last_name: string;
    tx_ref: string;
    callback_url: string;
    return_url: string;
  }) {
    const result = initialized.parse(await this.request("initialize", input));
    const url = new URL(result.data.checkout_url);
    if (
      url.protocol !== "https:" ||
      !(url.hostname === "chapa.co" || url.hostname.endsWith(".chapa.co"))
    )
      throw new Error("Unexpected checkout destination");
    return url.href;
  }
  async verify(reference: string) {
    return verified.parse(
      await this.request("verify/" + encodeURIComponent(reference)),
    ).data;
  }
}
