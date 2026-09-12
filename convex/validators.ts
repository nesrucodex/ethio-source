import { v } from "convex/values";
export const localized = v.object({
  en: v.string(),
  am: v.string(),
  om: v.string(),
});
export const currency = v.union(v.literal("USD"), v.literal("CNY"));
export const category = v.union(
  v.literal("electronics"),
  v.literal("fashion"),
  v.literal("home"),
  v.literal("beauty"),
  v.literal("sports"),
  v.literal("kids"),
  v.literal("office"),
  v.literal("automotive"),
);
export const stage = v.union(
  v.literal("confirmed"),
  v.literal("shipped"),
  v.literal("customs"),
  v.literal("ready"),
);
export const paymentStatus = v.union(
  v.literal("pending"),
  v.literal("paid"),
  v.literal("failed"),
  v.literal("expired"),
  v.literal("review"),
);
export const photoRef = v.union(
  v.object({ url: v.string() }),
  v.object({ storageId: v.id("_storage") }),
);
export const productFields = {
  slug: v.string(),
  name: localized,
  description: localized,
  category,
  sourcePrice: v.number(),
  currency,
  stock: v.number(),
  reserved: v.number(),
  image: v.string(),
  images: v.optional(v.array(v.string())),
  photos: v.optional(v.array(photoRef)),
  featured: v.boolean(),
  active: v.boolean(),
  supplierId: v.optional(v.string()),
  updatedAt: v.number(),
};
export const productDoc = v.object({
  _id: v.id("products"),
  _creationTime: v.number(),
  ...productFields,
});
export const rateFields = {
  key: v.string(),
  usd: v.number(),
  cny: v.number(),
  markup: v.number(),
  updatedAt: v.number(),
  source: v.string(),
};
export const rateDoc = v.object({
  _id: v.id("rates"),
  _creationTime: v.number(),
  ...rateFields,
});
export const orderFields = {
  userId: v.id("users"),
  reference: v.string(),
  items: v.array(
    v.object({
      productId: v.id("products"),
      name: v.string(),
      quantity: v.number(),
      unitPrice: v.number(),
      image: v.string(),
      imageStorageId: v.optional(v.id("_storage")),
    }),
  ),
  subtotal: v.number(),
  shipping: v.number(),
  total: v.number(),
  name: v.string(),
  email: v.string(),
  phone: v.string(),
  address: v.string(),
  paymentStatus,
  stage,
  events: v.array(v.object({ stage, at: v.number(), note: v.string() })),
  expiresAt: v.number(),
  checkoutUrl: v.optional(v.string()),
  paymentError: v.optional(v.string()),
};
export const orderDoc = v.object({
  _id: v.id("orders"),
  _creationTime: v.number(),
  ...orderFields,
});
