import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { productDoc, productFields, rateDoc } from "./validators";
import { productPhotos, resolveProductPhotos } from "./lib/photos";
import {
  MAX_PHOTO_BYTES,
  PHOTO_TYPES,
  validPhotoUrl,
} from "../src/lib/product-photos";
import { requireAdmin } from "./lib/access";
export const list = query({
  args: {},
  returns: v.array(productDoc),
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("active", true))
      .take(200);
    return Promise.all(
      products.map((product) => resolveProductPhotos(ctx, product)),
    );
  },
});
export const get = query({
  args: { slug: v.string() },
  returns: v.union(productDoc, v.null()),
  handler: async (ctx, { slug }) => {
    const p = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    return p?.active ? resolveProductPhotos(ctx, p) : null;
  },
});
export const rates = query({
  args: {},
  returns: v.union(rateDoc, v.null()),
  handler: (ctx) =>
    ctx.db
      .query("rates")
      .withIndex("by_key", (q) => q.eq("key", "ETB"))
      .unique(),
});
export const adminList = query({
  args: {},
  returns: v.array(productDoc),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const products = await ctx.db.query("products").order("desc").take(200);
    return Promise.all(
      products.map((product) => resolveProductPhotos(ctx, product)),
    );
  },
});
export const save = mutation({
  args: { id: v.optional(v.id("products")), ...productFields },
  returns: v.id("products"),
  handler: async (ctx, { id, ...data }) => {
    await requireAdmin(ctx);
    if (!data.slug.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) || !data.name.en.trim())
      throw new ConvexError("Name and a valid slug are required");
    if (
      !Number.isFinite(data.sourcePrice) ||
      data.sourcePrice <= 0 ||
      !Number.isInteger(data.stock) ||
      data.stock < 0
    )
      throw new ConvexError("Invalid price or stock");
    if ((data.images?.length ?? 0) > 7)
      throw new ConvexError("Use up to 7 additional product photos");
    const photos = productPhotos(data);
    if (!photos.length || photos.length > 8)
      throw new ConvexError("Add between 1 and 8 product photos");
    for (const photo of photos) {
      if ("url" in photo) {
        if (!validPhotoUrl(photo.url))
          throw new ConvexError("Use a public HTTPS image URL");
      } else {
        const upload = await ctx.db
          .query("productUploads")
          .withIndex("by_storage", (q) => q.eq("storageId", photo.storageId))
          .unique();
        const file = await ctx.db.system.get("_storage", photo.storageId);
        if (
          !upload ||
          !file ||
          file.size === 0 ||
          file.size > MAX_PHOTO_BYTES ||
          !PHOTO_TYPES.includes(file.contentType ?? "")
        )
          throw new ConvexError(
            "A photo is missing or invalid. Upload it again.",
          );
        await ctx.db.patch(upload._id, { attached: true });
      }
    }
    // Keep legacy URL fields free of generated storage URLs.
    if (data.photos) {
      const first = photos[0];
      data.image = "url" in first ? first.url : "";
      data.images = photos
        .slice(1)
        .flatMap((photo) => ("url" in photo ? [photo.url] : []));
    }
    const existing = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", data.slug))
      .unique();
    if (existing && existing._id !== id)
      throw new ConvexError("This slug already exists");
    if (id) {
      const old = await ctx.db.get(id);
      if (!old) throw new ConvexError("Product not found");
      await ctx.db.patch(id, {
        ...data,
        reserved: old.reserved,
        updatedAt: Date.now(),
      });
      return id;
    }
    return ctx.db.insert("products", {
      ...data,
      reserved: 0,
      updatedAt: Date.now(),
    });
  },
});
export const setRates = mutation({
  args: { usd: v.number(), cny: v.number(), markup: v.number() },
  returns: v.null(),
  handler: async (ctx, rates) => {
    await requireAdmin(ctx);
    if (
      rates.usd <= 0 ||
      rates.cny <= 0 ||
      rates.markup < 0 ||
      rates.markup > 200 ||
      !Object.values(rates).every(Number.isFinite)
    )
      throw new ConvexError("Invalid exchange rates");
    const row = await ctx.db
      .query("rates")
      .withIndex("by_key", (q) => q.eq("key", "ETB"))
      .unique();
    const data = {
      ...rates,
      key: "ETB",
      updatedAt: Date.now(),
      source: "Administrator",
    };
    if (row) await ctx.db.patch(row._id, data);
    else await ctx.db.insert("rates", data);
    return null;
  },
});

export const adminPage = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(productDoc),
  handler: async (ctx, { paginationOpts }) => {
    await requireAdmin(ctx);
    const result = await ctx.db
      .query("products")
      .withIndex("by_creation_time")
      .order("desc")
      .paginate(paginationOpts);
    return {
      ...result,
      page: await Promise.all(
        result.page.map((row) => resolveProductPhotos(ctx, row)),
      ),
    };
  },
});
