import { internal } from "./_generated/api";
import { paginationOptsValidator } from "convex/server";
import { requireAdmin, requireUser } from "./lib/access";
import {
  action,
  query,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { createAccount, getAuthUserId } from "@convex-dev/auth/server";
import { v, ConvexError } from "convex/values";

// Operator-only lookup. Public sign-in must not disclose whether an email exists.
export const passwordAccountId = internalQuery({
  args: { email: v.string() },
  returns: v.union(v.id("users"), v.null()),
  handler: async (ctx, { email }) => {
    const account = await ctx.db
      .query("authAccounts")
      .withIndex("providerAndAccountId", (q) =>
        q
          .eq("provider", "password")
          .eq("providerAccountId", email.trim().toLowerCase()),
      )
      .unique();
    return account?.userId ?? null;
  },
});
export const me = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      id: v.id("users"),
      name: v.string(),
      email: v.string(),
      isAdmin: v.boolean(),
    }),
  ),
  handler: async (ctx) => {
    const id = await getAuthUserId(ctx);
    if (!id) return null;
    const user = await ctx.db.get(id);
    if (!user) return null;
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_user", (q) => q.eq("userId", id))
      .unique();
    return {
      id,
      name: user.name ?? "Customer",
      email: user.email ?? "",
      isAdmin: !!admin,
    };
  },
});
export const grantAdmin = internalMutation({
  args: { userId: v.id("users") },
  returns: v.null(),
  handler: async (ctx, { userId }) => {
    if (!(await ctx.db.get(userId))) throw new Error("User not found");
    if (
      !(await ctx.db
        .query("admins")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique())
    )
      await ctx.db.insert("admins", { userId });
    return null;
  },
});

export const revokeAdmin = internalMutation({
  args: { userId: v.id("users") },
  returns: v.null(),
  handler: async (ctx, { userId }) => {
    const role = await ctx.db
      .query("admins")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (role) await ctx.db.delete(role._id);
    return null;
  },
});

const directoryUser = v.object({
  id: v.id("users"),
  name: v.string(),
  email: v.string(),
  phone: v.string(),
  joinedAt: v.number(),
  isAdmin: v.boolean(),
  emailVerified: v.boolean(),
  phoneVerified: v.boolean(),
});
export const directory = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(directoryUser),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, { paginationOpts }) => {
    await requireAdmin(ctx);
    const result = await ctx.db
      .query("users")
      .withIndex("by_creation_time")
      .order("desc")
      .paginate(paginationOpts);
    const page = await Promise.all(
      result.page.map(async (user) => ({
        id: user._id,
        name: user.name ?? "Customer",
        email: user.email ?? "",
        phone: user.phone ?? "",
        joinedAt: user._creationTime,
        emailVerified: user.emailVerificationTime !== undefined,
        phoneVerified: user.phoneVerificationTime !== undefined,
        isAdmin: !!(await ctx.db
          .query("admins")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .unique()),
      })),
    );
    return {
      page,
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    };
  },
});

export const checkCanCreate = internalQuery({
  args: { email: v.string() },
  returns: v.null(),
  handler: async (ctx, { email }) => {
    await requireAdmin(ctx);
    const account = await ctx.db
      .query("authAccounts")
      .withIndex("providerAndAccountId", (q) =>
        q.eq("provider", "password").eq("providerAccountId", email),
      )
      .unique();
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .first();
    if (account || user)
      throw new ConvexError("A user with this email already exists.");
    return null;
  },
});

export const create = action({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    phone: v.optional(v.string()),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    await ctx.runQuery(internal.users.checkCanCreate, { email });
    const name = args.name.trim();
    const phone = args.phone?.trim();
    if (name.length < 2 || name.length > 100)
      throw new ConvexError("Name must contain 2–100 characters.");
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw new ConvexError("Enter a valid email address.");
    if (args.password.length < 10 || args.password.length > 128)
      throw new ConvexError("Use a password of 10–128 characters.");
    if (phone && !/^(\+?251[79][0-9]{8}|0[79][0-9]{8})$/.test(phone))
      throw new ConvexError("Enter a valid Ethiopian mobile number.");
    try {
      const { user } = await createAccount(ctx, {
        provider: "password",
        account: { id: email, secret: args.password },
        profile: { name, email, ...(phone ? { phone } : {}) },
        shouldLinkViaEmail: false,
        shouldLinkViaPhone: false,
      });
      return user._id;
    } catch {
      throw new ConvexError(
        "Could not create this user. The email may already be registered. Refresh and try again.",
      );
    }
  },
});

// Reuse verified delivery details without maintaining a second customer profile.
export const deliveryDetails = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({ phone: v.string(), address: v.string() }),
  ),
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    const order = await ctx.db
      .query("orders")
      .withIndex("by_user_payment", (q) =>
        q.eq("userId", userId).eq("paymentStatus", "paid"),
      )
      .order("desc")
      .first();
    return order ? { phone: order.phone, address: order.address } : null;
  },
});
