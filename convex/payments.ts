import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v, ConvexError } from "convex/values";
import { ChapaClient } from "../src/services/api/chapa";
import { paymentEnv } from "./env";
export const start = action({
  args: { id: v.id("orders") },
  returns: v.string(),
  handler: async (ctx, { id }): Promise<string> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Sign in first");
    const order = await ctx.runQuery(internal.orders.forPayment, {
      id,
      userId,
    });
    if (
      !order ||
      order.paymentStatus !== "pending" ||
      order.expiresAt <= Date.now()
    )
      throw new ConvexError("This checkout has expired or is already paid");
    if (order.checkoutUrl) return order.checkoutUrl;
    const env = paymentEnv();
    try {
      const [first_name, ...rest] = order.name.split(" ");
      const url = await new ChapaClient(env.CHAPA_SECRET_KEY).initialize({
        amount: order.total.toFixed(2),
        currency: "ETB",
        email: order.email,
        first_name,
        last_name: rest.join(" ") || first_name,
        tx_ref: order.reference,
        callback_url: env.CONVEX_SITE_URL + "/payments/chapa/callback",
        return_url: env.SITE_URL + "/orders?payment=return",
      });
      await ctx.runMutation(internal.orders.checkout, { id, url });
      return url;
    } catch {
      await ctx.runMutation(internal.orders.checkout, {
        id,
        error:
          "Checkout initialization failed. You can retry from your orders.",
      });
      throw new ConvexError("Could not start payment. Retry from your orders.");
    }
  },
});
export const verify = internalAction({
  args: { reference: v.string() },
  returns: v.null(),
  handler: async (ctx, { reference }) => {
    const order = await ctx.runQuery(internal.orders.byReference, {
      reference,
    });
    if (!order) return null;
    const env = paymentEnv();
    const payment = await new ChapaClient(env.CHAPA_SECRET_KEY).verify(
      reference,
    );
    if (payment.tx_ref !== reference || payment.mode !== env.CHAPA_MODE)
      throw new Error("Payment reference or mode mismatch");
    if (!["success", "failed"].includes(payment.status)) return null;
    await ctx.runMutation(internal.orders.settle, {
      reference,
      amount: payment.amount,
      currency: payment.currency,
      success: payment.status === "success",
    });
    return null;
  },
});
export const recheck = action({
  args: { id: v.id("orders") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Sign in first");
    const order = await ctx.runQuery(internal.orders.forPayment, {
      id,
      userId,
    });
    if (!order) throw new ConvexError("Order not found");
    await ctx.runAction(internal.payments.verify, {
      reference: order.reference,
    });
    return null;
  },
});
