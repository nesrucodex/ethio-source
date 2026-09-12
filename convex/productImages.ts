import { mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v, ConvexError } from "convex/values";
import { requireAdmin } from "./lib/access";
import { MAX_PHOTO_BYTES, PHOTO_TYPES } from "../src/lib/product-photos";

export const uploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return ctx.storage.generateUploadUrl();
  },
});
export const register = mutation({
  args: { storageId: v.id("_storage") },
  returns: v.object({
    url: v.union(v.string(), v.null()),
    error: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, { storageId }) => {
    const ownerId = await requireAdmin(ctx);
    const existing = await ctx.db
      .query("productUploads")
      .withIndex("by_storage", (q) => q.eq("storageId", storageId))
      .unique();
    if (existing && existing.ownerId !== ownerId)
      throw new ConvexError("This upload belongs to another administrator");
    const file = await ctx.db.system.get("_storage", storageId);
    if (!file)
      return { url: null, error: "Upload not found. Please try again." };
    if (
      file.size === 0 ||
      file.size > MAX_PHOTO_BYTES ||
      !PHOTO_TYPES.includes(file.contentType ?? "")
    ) {
      if (!existing) await ctx.storage.delete(storageId);
      return {
        url: null,
        error: "Use a JPG, PNG, WebP, or AVIF image under 8 MB.",
      };
    }
    if (!existing) {
      const id = await ctx.db.insert("productUploads", {
        storageId,
        ownerId,
        attached: false,
      });
      await ctx.scheduler.runAfter(
        24 * 60 * 60 * 1000,
        internal.productImages.cleanup,
        { id },
      );
    }
    return { url: await ctx.storage.getUrl(storageId), error: null };
  },
});
export const cleanup = internalMutation({
  args: { id: v.id("productUploads") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const upload = await ctx.db.get(id);
    if (upload && !upload.attached) {
      await ctx.storage.delete(upload.storageId);
      await ctx.db.delete(id);
    }
    return null;
  },
});
