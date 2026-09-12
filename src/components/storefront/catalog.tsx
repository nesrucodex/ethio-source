"use client";
import { useDeferredValue, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CatalogFilters } from "./catalog-filters";
import { useCatalog, useTranslation } from "@/components/providers";
import {
  FilterToolbar,
  SearchField,
} from "@/components/shared/collection-controls";
import { ProductCard } from "./product-card";
import { EmptyState, LoadingCards } from "@/components/shared/states";
import { priceInBirr } from "@/lib/commerce";

export function Catalog() {
  const params = useSearchParams();
  const category = params.get("category") ?? "all";
  const { t, locale } = useTranslation();
  const { products, rates } = useCatalog();
  const [search, setSearch] = useState("");
  const deferred = useDeferredValue(search);
  const [sort, setSort] = useState("featured");
  const price = (p: NonNullable<typeof products>[number]) =>
    rates
      ? priceInBirr(
          p.sourcePrice,
          p.currency === "USD" ? rates.usd : rates.cny,
          rates.markup,
        )
      : 0;
  const filtered = products
    ?.filter(
      (p) =>
        (category === "all" || p.category === category) &&
        (p.name[locale] + p.name.en)
          .toLowerCase()
          .includes(deferred.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "low"
        ? price(a) - price(b)
        : sort === "high"
          ? price(b) - price(a)
          : Number(b.featured) - Number(a.featured),
    );
  return (
    <div className="shell page-content">
      <h1 className="sr-only">{t("shop")}</h1>
      <FilterToolbar className="mb-6">
        <SearchField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label={t("search")}
          placeholder={t("search")}
        />
        <CatalogFilters
          selected={category}
          sort={sort}
          onSortChange={setSort}
        />
      </FilterToolbar>
      {!filtered ? (
        <LoadingCards />
      ) : filtered.length ? (
        <div className="product-grid">
          {filtered.map((p) => (
            <ProductCard product={p} key={p._id} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No finds just yet"
          description="Try another search or category."
        />
      )}
    </div>
  );
}
