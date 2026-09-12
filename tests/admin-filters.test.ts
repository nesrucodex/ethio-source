import { expect, test } from "vitest";
import {
  matchesProduct,
  matchesUser,
  productFilterDefaults,
  userFilterDefaults,
  activeFilterCount,
} from "../src/components/admin/filter-models";
import { sampleProducts } from "../src/lib/catalog-data";
import type { Doc } from "../convex/_generated/dataModel";
const product = {
  ...sampleProducts[0],
  sourcePrice: 10,
  currency: "USD",
  active: true,
  featured: true,
  stock: 5,
  reserved: 5,
} as Doc<"products">;
const rates = { usd: 150, cny: 20, markup: 10 };
test("product filters combine publication, category, featured, available stock and comparable ETB prices", () => {
  expect(matchesProduct(product, productFilterDefaults, rates)).toBe(true);
  expect(
    matchesProduct(
      product,
      { ...productFilterDefaults, publication: "hidden" },
      rates,
    ),
  ).toBe(false);
  expect(
    matchesProduct(
      product,
      { ...productFilterDefaults, stock: "available" },
      rates,
    ),
  ).toBe(false);
  expect(
    matchesProduct(
      product,
      {
        ...productFilterDefaults,
        stock: "out",
        featured: "featured",
        category: product.category,
        min: "1650",
        max: "1650",
      },
      rates,
    ),
  ).toBe(true);
  expect(
    matchesProduct(
      { ...product, currency: "CNY", sourcePrice: 75 },
      { ...productFilterDefaults, min: "1650", max: "1650" },
      rates,
    ),
  ).toBe(true);
  expect(
    matchesProduct(product, { ...productFilterDefaults, min: "1651" }, rates),
  ).toBe(false);
  expect(
    matchesProduct(product, { ...productFilterDefaults, max: "100" }, null),
  ).toBe(false);
  expect(
    activeFilterCount({
      ...productFilterDefaults,
      publication: "hidden",
      min: "0",
    }),
  ).toBe(2);
});
test("user filters distinguish customer role, verified contact and missing phone", () => {
  const user = {
    isAdmin: false,
    emailVerified: true,
    phone: "",
    phoneVerified: false,
  };
  expect(
    matchesUser(user, {
      ...userFilterDefaults,
      role: "customer",
      email: "verified",
      phone: "missing",
    }),
  ).toBe(true);
  expect(matchesUser(user, { ...userFilterDefaults, role: "admin" })).toBe(
    false,
  );
  expect(
    matchesUser(user, { ...userFilterDefaults, phone: "unverified" }),
  ).toBe(false);
  expect(
    matchesUser(
      { ...user, phone: "0911234567" },
      { ...userFilterDefaults, phone: "unverified" },
    ),
  ).toBe(true);
  expect(activeFilterCount(userFilterDefaults)).toBe(0);
});
