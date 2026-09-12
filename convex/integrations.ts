import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { categoryIds } from "../shared/categories";
import {
  action,
  internalAction,
  internalMutation,
  query,
} from "./_generated/server";
import { internal, api } from "./_generated/api";
import { v, ConvexError } from "convex/values";
import { z } from "zod";
import { productFields } from "./validators";
import { requireAdmin } from "./lib/access";
const itemSchema = z.object({
  supplierId: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.object({
    en: z.string().min(1),
    am: z.string().min(1),
    om: z.string().min(1),
  }),
  description: z.object({ en: z.string(), am: z.string(), om: z.string() }),
  category: z.enum(categoryIds),
  sourcePrice: z.number().positive(),
  currency: z.enum(["USD", "CNY"]),
  stock: z.number().int().nonnegative(),
  image: z.url().refine((s) => new URL(s).hostname === "images.unsplash.com"),
  images: z
    .array(
      z.url().refine((s) => {
        const u = new URL(s);
        return (
          u.protocol === "https:" &&
          u.hostname === "images.unsplash.com" &&
          !u.username &&
          !u.password
        );
      }),
    )
    .max(7)
    .optional(),
  featured: z.boolean().default(false),
});
export const logs = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("syncLogs"),
      _creationTime: v.number(),
      kind: v.string(),
      status: v.string(),
      message: v.string(),
      at: v.number(),
    }),
  ),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return ctx.db.query("syncLogs").order("desc").take(30);
  },
});
export const log = internalMutation({
  args: { kind: v.string(), status: v.string(), message: v.string() },
  returns: v.null(),
  handler: async (ctx, data) => {
    await ctx.db.insert("syncLogs", { ...data, at: Date.now() });
    return null;
  },
});
export const applyProducts = internalMutation({
  args: { items: v.array(v.object(productFields)) },
  returns: v.null(),
  handler: async (ctx, { items }) => {
    for (const data of items) {
      const old = await ctx.db
        .query("products")
        .withIndex("by_supplier", (q) => q.eq("supplierId", data.supplierId))
        .unique();
      const slugOwner = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", data.slug))
        .unique();
      if (slugOwner && slugOwner._id !== old?._id)
        throw new Error("Supplier slug conflicts with an existing product");
      if (old) await ctx.db.patch(old._id, { ...data, reserved: old.reserved });
      else await ctx.db.insert("products", data);
    }
    return null;
  },
});
export const applyRates = internalMutation({
  args: { usd: v.number(), cny: v.number() },
  returns: v.null(),
  handler: async (ctx, data) => {
    const old = await ctx.db
      .query("rates")
      .withIndex("by_key", (q) => q.eq("key", "ETB"))
      .unique();
    const row = {
      ...data,
      key: "ETB",
      markup: old?.markup ?? 15,
      updatedAt: Date.now(),
      source: "Configured exchange feed",
    };
    if (old) await ctx.db.patch(old._id, row);
    else await ctx.db.insert("rates", row);
    return null;
  },
});
export const sync = internalAction({
  args: { kind: v.union(v.literal("supplier"), v.literal("rates")) },
  returns: v.null(),
  handler: async (ctx, { kind }) => {
    const endpoint =
      kind === "supplier"
        ? process.env.SUPPLIER_FEED_URL
        : process.env.EXCHANGE_FEED_URL;
    if (!endpoint) {
      await ctx.runMutation(internal.integrations.log, {
        kind,
        status: "skipped",
        message: "No feed configured",
      });
      return null;
    }
    try {
      if (new URL(endpoint).protocol !== "https:")
        throw new Error("Feed must use HTTPS");
      const token =
        kind === "supplier"
          ? process.env.SUPPLIER_API_KEY
          : process.env.EXCHANGE_API_KEY;
      const response = await fetch(endpoint, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok)
        throw new Error(`Feed returned HTTP ${response.status}`);
      const data = await response.json();
      if (kind === "supplier") {
        const rows = z
          .object({ products: z.array(itemSchema).max(200) })
          .parse(data);
        if (
          new Set(rows.products.map((p) => p.supplierId)).size !==
          rows.products.length
        )
          throw new Error("Duplicate supplier IDs");
        await ctx.runMutation(internal.integrations.applyProducts, {
          items: rows.products.map((p) => ({
            ...p,
            reserved: 0,
            active: true,
            updatedAt: Date.now(),
          })),
        });
      } else {
        const rates = z
          .object({ usd: z.number().positive(), cny: z.number().positive() })
          .parse(data);
        await ctx.runMutation(internal.integrations.applyRates, rates);
      }
      await ctx.runMutation(internal.integrations.log, {
        kind,
        status: "success",
        message: "Feed synchronized",
      });
    } catch {
      await ctx.runMutation(internal.integrations.log, {
        kind,
        status: "failed",
        message:
          "Feed failed validation or could not be fetched. Existing data preserved.",
      });
    }
    return null;
  },
});
export const run = action({
  args: { kind: v.union(v.literal("supplier"), v.literal("rates")) },
  returns: v.null(),
  handler: async (ctx, input) => {
    const me = await ctx.runQuery(api.users.me, {});
    if (!me?.isAdmin) throw new ConvexError("Administrator access required");
    await ctx.runAction(internal.integrations.sync, input);
    return null;
  },
});

export const logPage = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(
    v.object({
      _id: v.id("syncLogs"),
      _creationTime: v.number(),
      kind: v.string(),
      status: v.string(),
      message: v.string(),
      at: v.number(),
    }),
  ),
  handler: async (ctx, { paginationOpts }) => {
    await requireAdmin(ctx);
    return ctx.db
      .query("syncLogs")
      .withIndex("by_creation_time")
      .order("desc")
      .paginate(paginationOpts);
  },
});
