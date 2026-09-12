import { expect, test } from "vitest";
import { convexTest } from "convex-test";
import schema from "../convex/schema";
import { api } from "../convex/_generated/api";
import { sampleProducts } from "../src/lib/catalog-data";
const modules = import.meta.glob("../convex/**/*.{ts,js}");
test("admin pages protect records and reach past previous list limits", async () => {
  const t = convexTest(schema, modules);
  const { admin, buyer } = await t.run(async (ctx) => {
    const admin = await ctx.db.insert("users", { name: "Admin" });
    const buyer = await ctx.db.insert("users", { name: "Buyer" });
    await ctx.db.insert("admins", { userId: admin });
    for (let i = 0; i < 205; i++) {
      await ctx.db.insert("products", {
        ...sampleProducts[0],
        slug: `product-${i}`,
        stock: 1,
        reserved: 0,
        active: true,
        updatedAt: i,
      });
      await ctx.db.insert("orders", {
        userId: buyer,
        reference: `order-${i}`,
        items: [],
        subtotal: 100,
        shipping: 0,
        total: 100,
        name: "Buyer",
        email: "buyer@example.com",
        phone: "0911234567",
        address: "Addis Ababa",
        paymentStatus: i % 2 ? "paid" : "pending",
        stage: "confirmed",
        events: [],
        expiresAt: 1,
      });
      await ctx.db.insert("syncLogs", {
        kind: "supplier",
        status: "success",
        message: `Run ${i}`,
        at: i,
      });
    }
    return { admin, buyer };
  });
  const client = t.withIdentity({ subject: `${admin}|test` });
  const customer = t.withIdentity({ subject: `${buyer}|test` });
  for (const query of [
    api.catalog.adminPage,
    api.orders.adminPage,
    api.integrations.logPage,
  ]) {
    const args = { paginationOpts: { numItems: 20, cursor: null } };
    await expect(t.query(query, args)).rejects.toThrow("Please sign in");
    await expect(customer.query(query, args)).rejects.toThrow("Administrator");
    let cursor: string | null = null;
    const ids = new Set<string>();
    for (let i = 0; i < 12; i++) {
      const page: {
        page: { _id: string }[];
        isDone: boolean;
        continueCursor: string;
      } = await client.query(query, {
        paginationOpts: { numItems: 20, cursor },
      });
      expect(page.page.length).toBeLessThanOrEqual(20);
      for (const row of page.page) {
        expect(ids.has(row._id)).toBe(false);
        ids.add(row._id);
      }
      if (page.isDone) break;
      cursor = page.continueCursor;
    }
    expect(ids.size).toBe(205);
  }
  const paid = await client.query(api.orders.adminPage, {
    status: "paid",
    paginationOpts: { numItems: 20, cursor: null },
  });
  expect(paid.page).toHaveLength(20);
  expect(paid.page.every((row) => row.paymentStatus === "paid")).toBe(true);
  const empty = await client.query(api.orders.adminPage, {
    status: "failed",
    paginationOpts: { numItems: 20, cursor: null },
  });
  expect(empty.page).toEqual([]);
  expect(empty.isDone).toBe(true);
});
