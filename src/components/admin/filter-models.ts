import { priceInBirr } from "../../lib/commerce";
import type { Doc } from "../../../convex/_generated/dataModel";
export const productFilterDefaults = {
  category: "all",
  publication: "all",
  featured: "all",
  stock: "all",
  min: "",
  max: "",
};
export const userFilterDefaults = { role: "all", email: "all", phone: "all" };
export function activeFilterCount(filters: Record<string, string>) {
  return Object.values(filters).filter(
    (value) => value !== "all" && value !== "",
  ).length;
}
export function matchesProduct(
  product: Doc<"products">,
  filters: typeof productFilterDefaults,
  rates: Pick<Doc<"rates">, "usd" | "cny" | "markup"> | null | undefined,
) {
  if (filters.category !== "all" && product.category !== filters.category)
    return false;
  if (
    filters.publication !== "all" &&
    product.active !== (filters.publication === "published")
  )
    return false;
  if (
    filters.featured !== "all" &&
    product.featured !== (filters.featured === "featured")
  )
    return false;
  const available = Math.max(0, product.stock - product.reserved);
  if (filters.stock === "available" && available === 0) return false;
  if (filters.stock === "out" && available > 0) return false;
  if (filters.min !== "" || filters.max !== "") {
    if (!rates) return false;
    const price = priceInBirr(
      product.sourcePrice,
      product.currency === "USD" ? rates.usd : rates.cny,
      rates.markup,
    );
    if (filters.min !== "" && price < Number(filters.min)) return false;
    if (filters.max !== "" && price > Number(filters.max)) return false;
  }
  return true;
}
export function matchesUser(
  user: {
    isAdmin: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
    phone: string;
  },
  filters: typeof userFilterDefaults,
) {
  if (filters.role !== "all" && user.isAdmin !== (filters.role === "admin"))
    return false;
  if (
    filters.email !== "all" &&
    user.emailVerified !== (filters.email === "verified")
  )
    return false;
  if (filters.phone === "missing") return !user.phone;
  if (filters.phone === "verified") return !!user.phone && user.phoneVerified;
  if (filters.phone === "unverified")
    return !!user.phone && !user.phoneVerified;
  return true;
}
