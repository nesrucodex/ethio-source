"use client";
import Link from "next/link";
import { ArrowUpRight, LayoutGrid } from "lucide-react";
import { categoryIcons } from "./category-icons";
import { categoryIds } from "../../../shared/categories";
import { useCatalog, useTranslation } from "@/components/providers";
import { cn } from "@/lib/utils";
export function CategoryBrowser({ selected }: { selected?: string }) {
  const { t } = useTranslation();
  const { products } = useCatalog();
  return (
    <nav className="department-grid" aria-label="Shop by category">
      {selected !== undefined && (
        <Link
          href="/products"
          scroll={selected === undefined}
          className={cn(
            "department-card department-all",
            selected === "all" && "selected",
          )}
          aria-current={selected === "all" ? "page" : undefined}
        >
          <LayoutGrid size={22} />
          <span>
            <strong>{t("all")}</strong>
            <small>
              {products?.length ?? "…"} {t("results")}
            </small>
          </span>
          <ArrowUpRight size={15} />
        </Link>
      )}
      {categoryIds.map((id) => {
        const Icon = categoryIcons[id];
        const count = products?.filter((p) => p.category === id).length;
        return (
          <Link
            key={id}
            href={`/products?category=${id}`}
            scroll={selected === undefined}
            className={cn("department-card", selected === id && "selected")}
            aria-current={selected === id ? "page" : undefined}
          >
            <Icon size={24} strokeWidth={1.5} />
            <span>
              <strong>{t(id)}</strong>
              <small>{t(`${id}Desc`)}</small>
              <em>
                {count ?? "…"} {t("results")}
              </em>
            </span>
            <ArrowUpRight size={15} />
          </Link>
        );
      })}
    </nav>
  );
}
