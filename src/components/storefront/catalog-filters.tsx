"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  SlidersHorizontal,
  ListFilter,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  LayoutGrid,
  RotateCcw,
} from "lucide-react";
import { useTranslation } from "@/components/providers";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  SelectionList,
  SelectionRadio,
  SelectionLink,
} from "@/components/shared/selection-list";
import { categoryIds } from "../../../shared/categories";
import { categoryIcons } from "./category-icons";
import "./catalog-filters.css";
const sortOptions = [
  { value: "featured", label: "newest", icon: ListFilter },
  { value: "low", label: "low", icon: ArrowDownWideNarrow },
  { value: "high", label: "high", icon: ArrowUpNarrowWide },
] as const;
export function CatalogFilters({
  selected,
  sort,
  onSortChange,
}: {
  selected: string;
  sort: string;
  onSortChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();
  const active = Number(selected !== "all") + Number(sort !== "featured");
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="category-filter-trigger">
          <SlidersHorizontal size={16} />
          {t("filters")}
          {active > 0 && (
            <span className="filter-count">
              {active}
              <span className="sr-only"> {t("activeFilters")}</span>
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="catalog-filter-panel w-full sm:max-w-md">
        <SheetHeader className="filter-panel-header">
          <SheetTitle>{t("filters")}</SheetTitle>
          <SheetDescription>{t("filterHint")}</SheetDescription>
        </SheetHeader>
        <div className="filter-panel-body">
          <fieldset className="filter-panel-section">
            <legend>{t("sort")}</legend>
            <SelectionList>
              {sortOptions.map((option) => (
                <SelectionRadio
                  key={option.value}
                  icon={option.icon}
                  name="catalog-sort"
                  value={option.value}
                  checked={sort === option.value}
                  onChange={() => onSortChange(option.value)}
                >
                  {t(option.label)}
                </SelectionRadio>
              ))}
            </SelectionList>
          </fieldset>
          <section
            className="filter-panel-section"
            aria-labelledby="filter-categories-title"
          >
            <h3 id="filter-categories-title">{t("categories")}</h3>
            <SelectionList>
              <SelectionLink
                href="/products"
                scroll={false}
                icon={LayoutGrid}
                aria-current={selected === "all" ? "page" : undefined}
              >
                {t("all")}
              </SelectionLink>
              {categoryIds.map((id) => (
                <SelectionLink
                  key={id}
                  href={`/products?category=${id}`}
                  scroll={false}
                  icon={categoryIcons[id]}
                  aria-current={selected === id ? "page" : undefined}
                >
                  {t(id)}
                </SelectionLink>
              ))}
            </SelectionList>
          </section>
        </div>
        <SheetFooter className="filter-panel-footer">
          <Button
            variant="ghost"
            disabled={active === 0}
            onClick={() => {
              onSortChange("featured");
              router.replace("/products", { scroll: false });
            }}
          >
            <RotateCcw size={15} aria-hidden="true" />
            {t("resetFilters")}
          </Button>
          <SheetClose asChild>
            <Button>{t("done")}</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
