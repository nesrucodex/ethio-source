import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { convexTest } from "convex-test";
import schema from "../convex/schema";
import { api, internal } from "../convex/_generated/api";
import { sampleProducts } from "../src/lib/catalog-data";
import { priceInBirr, shippingFee } from "../src/lib/commerce";
const modules = import.meta.glob("../convex/**/*.{ts,js}");
async function setup() {
  const t = convexTest(schema, modules);
  const ids = await t.run(async (ctx) => {
    const userId = await ctx.db.insert("users", {
      name: "Test buyer",
      email: "buyer@example.com",
    });
    const otherId = await ctx.db.insert("users", {
      name: "Other",
      email: "other@example.com",
    });
    const productId = await ctx.db.insert("products", {
      ...sampleProducts[0],
      stock: 3,
      reserved: 0,
      active: true,
      updatedAt: Date.now(),
    });
    await ctx.db.insert("rates", {
      key: "ETB",
      usd: 150,
      cny: 21,
      markup: 15,
      source: "test",
      updatedAt: Date.now(),
    });
    return { userId, otherId, productId };
  });
  const buyer = t.withIdentity({ subject: `${ids.userId}|test-session` });
  return { t, buyer, ...ids };
}
const details = {
  name: "Test buyer",
  email: "buyer@example.com",
  phone: "0911234567",
  address: "Addis Ababa, Bole, building 10",
};
beforeEach(() => {
  vi.stubEnv("CHAPA_SECRET_KEY", "test-only");
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});
describe("Commerce security and integrity", () => {
  test("rejects unauthenticated checkout and customer admin mutations", async () => {
    const { t, buyer, productId } = await setup();
    await expect(
      t.mutation(api.orders.create, {
        ...details,
        items: [{ productId, quantity: 1 }],
      }),
    ).rejects.toThrow();
    await expect(buyer.query(api.orders.all, {})).rejects.toThrow(
      "Administrator",
    );
    await expect(
      buyer.mutation(api.catalog.setRates, { usd: 1, cny: 1, markup: 0 }),
    ).rejects.toThrow("Administrator");
  });
  test("calculates authoritative prices and prevents overselling", async () => {
    const { t, buyer, productId } = await setup();
    const id = await buyer.mutation(api.orders.create, {
      ...details,
      items: [{ productId, quantity: 2 }],
    });
    const order = await t.run((ctx) => ctx.db.get(id));
    expect(order?.subtotal).toBe(11040);
    expect(order?.total).toBe(11490);
    await expect(
      buyer.mutation(api.orders.create, {
        ...details,
        items: [{ productId, quantity: 2 }],
      }),
    ).rejects.toThrow("no longer available");
    await t.finishAllScheduledFunctions(() => vi.runAllTimers());
  });
  test("rejects duplicate and fractional cart entries", async () => {
    const { buyer, productId } = await setup();
    await expect(
      buyer.mutation(api.orders.create, {
        ...details,
        items: [
          { productId, quantity: 1 },
          { productId, quantity: 1 },
        ],
      }),
    ).rejects.toThrow("Invalid cart");
    await expect(
      buyer.mutation(api.orders.create, {
        ...details,
        items: [{ productId, quantity: 1.5 }],
      }),
    ).rejects.toThrow("Quantity");
  });
  test("payment is amount-checked and duplicate notifications are idempotent", async () => {
    const { t, buyer, productId } = await setup();
    const id = await buyer.mutation(api.orders.create, {
      ...details,
      items: [{ productId, quantity: 1 }],
    });
    const order = (await t.run((ctx) => ctx.db.get(id)))!;
    await expect(
      t.mutation(internal.orders.settle, {
        reference: order.reference,
        amount: 1,
        currency: "ETB",
        success: true,
      }),
    ).rejects.toThrow("amount");
    const settlement = {
      reference: order.reference,
      amount: order.total,
      currency: "ETB",
      success: true,
    };
    await t.mutation(internal.orders.settle, settlement);
    await t.mutation(internal.orders.settle, settlement);
    expect(
      await t.run(async (ctx) => {
        const p = (await ctx.db.get(productId))!;
        const o = (await ctx.db.get(id))!;
        return {
          stock: p.stock,
          reserved: p.reserved,
          events: o.events.length,
          status: o.paymentStatus,
        };
      }),
    ).toEqual({ stock: 2, reserved: 0, events: 1, status: "paid" });
    await t.finishAllScheduledFunctions(() => vi.runAllTimers());
  });
  test("expiry releases stock and a late payment goes to review", async () => {
    const { t, buyer, productId } = await setup();
    const id = await buyer.mutation(api.orders.create, {
      ...details,
      items: [{ productId, quantity: 1 }],
    });
    const order = (await t.run((ctx) => ctx.db.get(id)))!;
    await t.finishAllScheduledFunctions(() => vi.runAllTimers());
    expect((await t.run((ctx) => ctx.db.get(productId)))?.reserved).toBe(0);
    await t.mutation(internal.orders.settle, {
      reference: order.reference,
      amount: order.total,
      currency: "ETB",
      success: true,
    });
    expect((await t.run((ctx) => ctx.db.get(id)))?.paymentStatus).toBe(
      "review",
    );
    expect((await t.run((ctx) => ctx.db.get(productId)))?.stock).toBe(3);
  });
  test("customer orders are private and cargo must advance sequentially", async () => {
    const { t, buyer, userId, otherId, productId } = await setup();
    const id = await buyer.mutation(api.orders.create, {
      ...details,
      items: [{ productId, quantity: 1 }],
    });
    expect(
      await t
        .withIdentity({ subject: `${otherId}|other-session` })
        .query(api.orders.mine, {}),
    ).toEqual([]);
    await expect(
      buyer.mutation(api.orders.advance, {
        id,
        stage: "shipped",
        note: "Sent",
      }),
    ).rejects.toThrow("Administrator");
    await t.run((ctx) => ctx.db.insert("admins", { userId }));
    await expect(
      buyer.mutation(api.orders.advance, {
        id,
        stage: "shipped",
        note: "Sent",
      }),
    ).rejects.toThrow("paid");
    const o = (await t.run((ctx) => ctx.db.get(id)))!;
    await t.mutation(internal.orders.settle, {
      reference: o.reference,
      amount: o.total,
      currency: "ETB",
      success: true,
    });
    await expect(
      buyer.mutation(api.orders.advance, { id, stage: "ready", note: "Ready" }),
    ).rejects.toThrow("next cargo stage");
    await buyer.mutation(api.orders.advance, {
      id,
      stage: "shipped",
      note: "Dispatched",
    });
    expect((await t.run((ctx) => ctx.db.get(id)))?.stage).toBe("shipped");
    await t.finishAllScheduledFunctions(() => vi.runAllTimers());
  });
  test("rounds prices and applies the delivery threshold", () => {
    expect(priceInBirr(0.1, 150, 15)).toBe(17.25);
    expect(shippingFee(14999.99)).toBe(450);
    expect(shippingFee(15000)).toBe(0);
  });
});

describe("Product gallery administration", () => {
  test("saves optional photos, rejects unsafe URLs and excessive galleries", async () => {
    const { t, userId } = await setup();
    await t.run((ctx) => ctx.db.insert("admins", { userId }));
    const admin = t.withIdentity({ subject: `${userId}|test-session` });
    const product = {
      ...sampleProducts[0],
      slug: "gallery-test",
      active: true,
      reserved: 0,
      updatedAt: Date.now(),
    };
    const image =
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600";
    const id = await admin.mutation(api.catalog.save, {
      ...product,
      images: [image],
    });
    expect(
      (await admin.query(api.catalog.get, { slug: product.slug }))?.images,
    ).toEqual([image]);
    await expect(
      admin.mutation(api.catalog.save, {
        ...product,
        id,
        images: ["http://example.com/photo.jpg"],
      }),
    ).rejects.toThrow("HTTPS image URL");
    await expect(
      admin.mutation(api.catalog.save, {
        ...product,
        id,
        images: Array(8).fill(image),
      }),
    ).rejects.toThrow("7 additional");
    await admin.mutation(api.catalog.save, { ...product, id, images: [] });
    expect(
      (await admin.query(api.catalog.get, { slug: product.slug }))?.images,
    ).toEqual([]);
  });
});

describe("Uploaded product photos", () => {
  test("requires admin access to upload and register", async () => {
    const { t, buyer } = await setup();
    await expect(t.mutation(api.productImages.uploadUrl, {})).rejects.toThrow(
      "sign in",
    );
    await expect(
      buyer.mutation(api.productImages.uploadUrl, {}),
    ).rejects.toThrow("Administrator");
  });
  test("stores IDs, resolves gallery URLs, and retains saved files during cleanup", async () => {
    const { t, userId } = await setup();
    await t.run((ctx) => ctx.db.insert("admins", { userId }));
    const admin = t.withIdentity({ subject: `${userId}|test-session` });
    const storageId = await t.run((ctx) =>
      ctx.storage.store(
        new Blob([new Uint8Array([1, 2, 3])], { type: "image/png" }),
      ),
    );
    // convex-test 0.0.58 omits contentType when storing blobs; supply real upload metadata.
    await t.run(async (ctx) => {
      // @ts-expect-error Only the test storage emulator permits patching a system row.
      await ctx.db.patch(storageId, { contentType: "image/png" });
    });
    const registered = await admin.mutation(api.productImages.register, {
      storageId,
    });
    expect(registered.url).toBeTruthy();
    const id = await admin.mutation(api.catalog.save, {
      ...sampleProducts[0],
      slug: "uploaded-photo-test",
      image: "",
      photos: [{ storageId }, { url: "https://example.com/product.jpg" }],
      active: true,
      reserved: 0,
      updatedAt: Date.now(),
    });
    const stored = await t.run((ctx) => ctx.db.get(id));
    expect(stored?.image).toBe("");
    expect(stored?.photos?.[0]).toEqual({ storageId });
    const resolved = await admin.query(api.catalog.get, {
      slug: "uploaded-photo-test",
    });
    expect(resolved?.image).toBe(registered.url);
    expect(resolved?.images).toEqual(["https://example.com/product.jpg"]);
    const orderId = await admin.mutation(api.orders.create, {
      ...details,
      items: [{ productId: id, quantity: 1 }],
    });
    const order = await t.run((ctx) => ctx.db.get(orderId));
    expect(order?.items[0].imageStorageId).toBe(storageId);
    expect((await admin.query(api.orders.mine, {}))[0].items[0].image).toBe(
      registered.url,
    );
    await t.finishAllScheduledFunctions(() => vi.runAllTimers());
    expect(await t.run((ctx) => ctx.storage.getUrl(storageId))).toBeTruthy();
  });
  test("rejects invalid file types and cleans up abandoned uploads", async () => {
    const { t, userId } = await setup();
    await t.run((ctx) => ctx.db.insert("admins", { userId }));
    const admin = t.withIdentity({ subject: `${userId}|test-session` });
    const invalid = await t.run((ctx) =>
      ctx.storage.store(new Blob(["text"], { type: "text/plain" })),
    );
    expect(
      (await admin.mutation(api.productImages.register, { storageId: invalid }))
        .error,
    ).toBeTruthy();
    expect(await t.run((ctx) => ctx.storage.getUrl(invalid))).toBeNull();
    const abandoned = await t.run((ctx) =>
      ctx.storage.store(new Blob(["png"], { type: "image/png" })),
    );
    await t.run(async (ctx) => {
      // @ts-expect-error Supply the upload MIME type omitted by convex-test.
      await ctx.db.patch(abandoned, { contentType: "image/png" });
    });
    expect(
      (
        await admin.mutation(api.productImages.register, {
          storageId: abandoned,
        })
      ).url,
    ).toBeTruthy();
    await t.finishAllScheduledFunctions(() => vi.runAllTimers());
    expect(await t.run((ctx) => ctx.storage.getUrl(abandoned))).toBeNull();
  });
});
