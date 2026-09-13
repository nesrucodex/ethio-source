import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { productFields, rateFields, orderFields } from "./validators";
export default defineSchema({
  ...authTables,
  admins: defineTable({ userId: v.id("users") }).index("by_user", ["userId"]),
  productUploads: defineTable({
    storageId: v.id("_storage"),
    ownerId: v.id("users"),
    attached: v.boolean(),
  }).index("by_storage", ["storageId"]),
  products: defineTable(productFields)
    .index("by_active", ["active"])
    .index("by_slug", ["slug"])
    .index("by_supplier", ["supplierId"]),
  rates: defineTable(rateFields).index("by_key", ["key"]),
  orders: defineTable(orderFields)
    .index("by_user", ["userId"])
    .index("by_user_payment", ["userId", "paymentStatus"])
    .index("by_reference", ["reference"])
    .index("by_payment", ["paymentStatus"]),
  syncLogs: defineTable({
    kind: v.string(),
    status: v.string(),
    message: v.string(),
    at: v.number(),
  }).index("by_kind", ["kind"]),
});
