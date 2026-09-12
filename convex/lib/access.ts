import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { QueryCtx, MutationCtx } from "../_generated/server";
export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const id = await getAuthUserId(ctx);
  if (!id) throw new ConvexError("Please sign in to continue");
  return id;
}
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const id = await requireUser(ctx);
  if (
    !(await ctx.db
      .query("admins")
      .withIndex("by_user", (q) => q.eq("userId", id))
      .unique())
  )
    throw new ConvexError("Administrator access required");
  return id;
}
