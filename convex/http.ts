import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";
const http = httpRouter();
auth.addHttpRoutes(http);
http.route({
  path: "/payments/chapa/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = process.env.CHAPA_WEBHOOK_SECRET;
    if (!secret) return new Response("Not configured", { status: 503 });
    const raw = await request.text();
    if (raw.length > 32000) return new Response("Too large", { status: 413 });
    const signature = request.headers.get("x-chapa-signature");
    if (!signature || !/^[a-f0-9]{64}$/i.test(signature))
      return new Response("Unauthorized", { status: 401 });
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const bytes = Uint8Array.from(signature.match(/.{2}/g)!, (x) =>
      parseInt(x, 16),
    );
    if (
      !(await crypto.subtle.verify(
        "HMAC",
        key,
        bytes,
        new TextEncoder().encode(raw),
      ))
    )
      return new Response("Unauthorized", { status: 401 });
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }
    const reference = payload.tx_ref ?? payload.data?.tx_ref;
    if (typeof reference !== "string" || reference.length > 100)
      return new Response("Invalid reference", { status: 400 });
    await ctx.runAction(internal.payments.verify, { reference });
    return new Response("OK");
  }),
});
http.route({
  path: "/payments/chapa/callback",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const reference =
      new URL(request.url).searchParams.get("tx_ref") ??
      new URL(request.url).searchParams.get("trx_ref");
    if (!reference || reference.length > 100)
      return new Response("Invalid reference", { status: 400 });
    // Callback data is untrusted; only the authenticated provider API can settle an order.
    await ctx.runAction(internal.payments.verify, { reference });
    return new Response("OK");
  }),
});
export default http;
