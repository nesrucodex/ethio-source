import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import {
  query,
  mutation,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { v, ConvexError } from "convex/values";
import { requireUser, requireAdmin } from "./lib/access";
import { productPhotos, resolveOrderPhotos } from "./lib/photos";
import { orderDoc, stage, paymentStatus } from "./validators";
import {
  priceInBirr,
  shippingFee,
  validQuantity,
  stages,
} from "../src/lib/commerce";
export const mine = query({
  args: {},
  returns: v.array(orderDoc),
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(100);
    return Promise.all(orders.map((order) => resolveOrderPhotos(ctx, order)));
  },
});
export const paymentSummary = query({
  args: { reference: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      id: v.id("orders"),
      reference: v.string(),
      total: v.number(),
      paymentStatus,
      expiresAt: v.number(),
      checkoutStarted: v.boolean(),
      paymentError: v.optional(v.string()),
    }),
  ),
  handler: async (ctx, { reference }) => {
    const userId = await requireUser(ctx);
    if (reference.length > 100) return null;
    const id = ctx.db.normalizeId("orders", reference);
    const order = id
      ? await ctx.db.get(id)
      : await ctx.db
          .query("orders")
          .withIndex("by_reference", (q) => q.eq("reference", reference))
          .unique();
    if (!order || order.userId !== userId) return null;
    return {
      id: order._id,
      reference: order.reference,
      total: order.total,
      paymentStatus: order.paymentStatus,
      expiresAt: order.expiresAt,
      checkoutStarted: !!order.checkoutUrl,
      paymentError: order.paymentError,
    };
  },
});
export const all = query({
  args: {},
  returns: v.array(orderDoc),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const orders = await ctx.db.query("orders").order("desc").take(200);
    return Promise.all(orders.map((order) => resolveOrderPhotos(ctx, order)));
  },
});
export const create = mutation({
  args: {
    items: v.array(
      v.object({ productId: v.id("products"), quantity: v.number() }),
    ),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    address: v.string(),
  },
  returns: v.id("orders"),
  handler: async (ctx, input) => {
    const userId = await requireUser(ctx);
    if (!process.env.CHAPA_SECRET_KEY)
      throw new ConvexError(
        "Payments are not enabled yet. Please try again later.",
      );
    if (
      input.items.length < 1 ||
      input.items.length > 30 ||
      new Set(input.items.map((i) => i.productId)).size !== input.items.length
    )
      throw new ConvexError("Invalid cart");
    if (
      input.name.trim().length < 2 ||
      input.name.length > 100 ||
      input.address.trim().length < 8 ||
      input.address.length > 500 ||
      !/^\+?251[79]\d{8}$|^0[79]\d{8}$/.test(input.phone) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)
    )
      throw new ConvexError("Check your contact and delivery details");
    const recent = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(10);
    if (
      recent.filter(
        (o) => o.paymentStatus === "pending" && o.expiresAt > Date.now(),
      ).length >= 3
    )
      throw new ConvexError(
        "Complete an existing checkout before starting another",
      );
    const rates = await ctx.db
      .query("rates")
      .withIndex("by_key", (q) => q.eq("key", "ETB"))
      .unique();
    if (!rates) throw new ConvexError("Pricing is unavailable");
    const items = [];
    for (const item of input.items) {
      if (!validQuantity(item.quantity))
        throw new ConvexError("Quantity must be between 1 and 50");
      const p = await ctx.db.get(item.productId);
      if (!p || !p.active || p.stock - p.reserved < item.quantity)
        throw new ConvexError(
          "An item is no longer available in the requested quantity",
        );
      await ctx.db.patch(p._id, { reserved: p.reserved + item.quantity });
      const cover = productPhotos(p)[0];
      items.push({
        productId: p._id,
        name: p.name.en,
        quantity: item.quantity,
        unitPrice: priceInBirr(
          p.sourcePrice,
          p.currency === "USD" ? rates.usd : rates.cny,
          rates.markup,
        ),
        image: cover && "url" in cover ? cover.url : "",
        ...(cover && "storageId" in cover
          ? { imageStorageId: cover.storageId }
          : {}),
      });
    }
    const subtotal =
      Math.round(
        items.reduce((s, i) => s + i.unitPrice * i.quantity, 0) * 100,
      ) / 100;
    const shipping = shippingFee(subtotal);
    const id = await ctx.db.insert("orders", {
      ...input,
      userId,
      items,
      reference: "ES-" + crypto.randomUUID(),
      subtotal,
      shipping,
      total: Math.round((subtotal + shipping) * 100) / 100,
      paymentStatus: "pending",
      stage: "confirmed",
      events: [],
      expiresAt: Date.now() + 30 * 60 * 1000,
    });
    await ctx.scheduler.runAfter(30 * 60 * 1000, internal.orders.expire, {
      id,
    });
    return id;
  },
});
export const forPayment = internalQuery({
  args: { id: v.id("orders"), userId: v.id("users") },
  returns: v.union(orderDoc, v.null()),
  handler: async (ctx, { id, userId }) => {
    const o = await ctx.db.get(id);
    return o?.userId === userId ? o : null;
  },
});
export const byReference = internalQuery({
  args: { reference: v.string() },
  returns: v.union(orderDoc, v.null()),
  handler: (ctx, { reference }) =>
    ctx.db
      .query("orders")
      .withIndex("by_reference", (q) => q.eq("reference", reference))
      .unique(),
});
export const checkout = internalMutation({
  args: {
    id: v.id("orders"),
    url: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { id, url, error }) => {
    const order = await ctx.db.get(id);
    if (!order || order.paymentStatus !== "pending") return null;
    await ctx.db.patch(id, {
      ...(url ? { checkoutUrl: url, paymentError: undefined } : {}),
      ...(error ? { paymentError: error } : {}),
    });
    return null;
  },
});
export const expire = internalMutation({
  args: { id: v.id("orders") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const order = await ctx.db.get(id);
    if (!order || !["pending", "failed"].includes(order.paymentStatus))
      return null;
    for (const item of order.items) {
      const p = await ctx.db.get(item.productId);
      if (p)
        await ctx.db.patch(p._id, {
          reserved: Math.max(0, p.reserved - item.quantity),
        });
    }
    await ctx.db.patch(id, { paymentStatus: "expired" });
    return null;
  },
});
export const settle = internalMutation({
  args: {
    reference: v.string(),
    amount: v.number(),
    currency: v.string(),
    success: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, input) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_reference", (q) => q.eq("reference", input.reference))
      .unique();
    if (!order || ["paid", "review"].includes(order.paymentStatus)) return null;
    if (!input.success) {
      if (order.paymentStatus === "pending")
        await ctx.db.patch(order._id, { paymentStatus: "failed" });
      return null;
    }
    if (
      input.currency !== "ETB" ||
      Math.round(input.amount * 100) !== Math.round(order.total * 100)
    )
      throw new ConvexError("Payment amount does not match");
    if (order.paymentStatus === "expired") {
      await ctx.db.patch(order._id, {
        paymentStatus: "review",
        paymentError:
          "Payment received after reservation expired. Review stock and arrange fulfillment or refund.",
      });
      return null;
    }
    let available = true;
    for (const item of order.items) {
      const p = await ctx.db.get(item.productId);
      if (!p || p.stock < item.quantity) available = false;
    }
    for (const item of order.items) {
      const p = await ctx.db.get(item.productId);
      if (p)
        await ctx.db.patch(p._id, {
          reserved: Math.max(0, p.reserved - item.quantity),
          stock: available ? p.stock - item.quantity : p.stock,
        });
    }
    await ctx.db.patch(
      order._id,
      available
        ? {
            paymentStatus: "paid",
            events: [
              {
                stage: "confirmed",
                at: Date.now(),
                note: "Payment verified. Your order is confirmed.",
              },
            ],
          }
        : {
            paymentStatus: "review",
            paymentError:
              "Supplier stock changed. Arrange fulfillment or refund.",
          },
    );
    return null;
  },
});
export const advance = mutation({
  args: { id: v.id("orders"), stage, note: v.string() },
  returns: v.null(),
  handler: async (ctx, { id, stage, note }) => {
    await requireAdmin(ctx);
    const order = await ctx.db.get(id);
    if (!order || order.paymentStatus !== "paid")
      throw new ConvexError("Only paid orders can move through cargo tracking");
    if (stages.indexOf(stage) !== stages.indexOf(order.stage) + 1)
      throw new ConvexError("Move to the next cargo stage");
    if (!note.trim() || note.length > 500)
      throw new ConvexError("Add a short tracking note");
    await ctx.db.patch(id, {
      stage,
      events: [...order.events, { stage, at: Date.now(), note }],
    });
    return null;
  },
});

export const adminPage = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(paymentStatus),
  },
  returns: paginationResultValidator(orderDoc),
  handler: async (ctx, { paginationOpts, status }) => {
    await requireAdmin(ctx);
    const result = await (
      status
        ? ctx.db
            .query("orders")
            .withIndex("by_payment", (q) => q.eq("paymentStatus", status))
        : ctx.db.query("orders").withIndex("by_creation_time")
    )
      .order("desc")
      .paginate(paginationOpts);
    return {
      ...result,
      page: await Promise.all(
        result.page.map((row) => resolveOrderPhotos(ctx, row)),
      ),
    };
  },
});
