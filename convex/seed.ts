import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { sampleProducts } from "../src/lib/catalog-data";
export const catalog = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    for (const item of sampleProducts) {
      if (
        !(await ctx.db
          .query("products")
          .withIndex("by_slug", (q) => q.eq("slug", item.slug))
          .unique())
      )
        await ctx.db.insert("products", {
          ...item,
          reserved: 0,
          active: true,
          updatedAt: Date.now(),
        });
    }
    if (
      !(await ctx.db
        .query("rates")
        .withIndex("by_key", (q) => q.eq("key", "ETB"))
        .unique())
    )
      await ctx.db.insert("rates", {
        key: "ETB",
        usd: 150,
        cny: 21,
        markup: 15,
        updatedAt: Date.now(),
        source: "Sample rates — configure before launch",
      });
    return null;
  },
});
