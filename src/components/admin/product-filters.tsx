"use client";
import { useId } from "react";
import { categoryIds } from "../../../shared/categories";
import { categoryLabels } from "./category-labels";
import { FormSection } from "@/components/shared/form-section";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ListFilters, FilterSelect } from "./list-filters";
import { activeFilterCount, productFilterDefaults } from "./filter-models";
export function ProductFilters({
  value,
  onChange,
  pricesAvailable,
}: {
  value: typeof productFilterDefaults;
  onChange: (value: typeof productFilterDefaults) => void;
  pricesAvailable: boolean;
}) {
  const id = useId();
  const set = (key: keyof typeof value, next: string) =>
    onChange({ ...value, [key]: next });
  const invalidRange =
    value.min !== "" &&
    value.max !== "" &&
    Number(value.min) > Number(value.max);
  return (
    <ListFilters
      count={activeFilterCount(value)}
      onReset={() => onChange(productFilterDefaults)}
    >
      <FormSection>
        <FilterSelect
          label="Category"
          value={value.category}
          onChange={(v) => set("category", v)}
          options={[
            { value: "all", label: "All categories" },
            ...categoryIds.map((category) => ({
              value: category,
              label: categoryLabels[category],
            })),
          ]}
        />
        <FilterSelect
          label="Publication"
          value={value.publication}
          onChange={(v) => set("publication", v)}
          options={[
            { value: "all", label: "All products" },
            { value: "published", label: "Published" },
            { value: "hidden", label: "Hidden" },
          ]}
        />
        <FilterSelect
          label="Featured"
          value={value.featured}
          onChange={(v) => set("featured", v)}
          options={[
            { value: "all", label: "All products" },
            { value: "featured", label: "Featured" },
            { value: "standard", label: "Not featured" },
          ]}
        />
        <FilterSelect
          label="Availability"
          value={value.stock}
          onChange={(v) => set("stock", v)}
          options={[
            { value: "all", label: "Any stock level" },
            { value: "available", label: "In stock" },
            { value: "out", label: "Out of stock" },
          ]}
        />
      </FormSection>
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-sm font-medium">
          Selling price · ETB
        </legend>
        <FormSection>
          <Field>
            <FieldLabel htmlFor={`${id}-min`}>Minimum</FieldLabel>
            <Input
              id={`${id}-min`}
              type="number"
              min="0"
              step="0.01"
              placeholder="No minimum"
              value={value.min}
              onChange={(e) => set("min", e.target.value)}
              disabled={!pricesAvailable}
              aria-describedby={`${id}-help`}
            />
          </Field>
          <Field data-invalid={invalidRange || undefined}>
            <FieldLabel htmlFor={`${id}-max`}>Maximum</FieldLabel>
            <Input
              id={`${id}-max`}
              type="number"
              min="0"
              step="0.01"
              placeholder="No maximum"
              value={value.max}
              onChange={(e) => set("max", e.target.value)}
              disabled={!pricesAvailable}
              aria-invalid={invalidRange || undefined}
              aria-describedby={`${id}-help`}
            />
          </Field>
        </FormSection>
        <p
          id={`${id}-help`}
          role={invalidRange ? "alert" : undefined}
          className={
            invalidRange
              ? "text-xs text-destructive"
              : "text-xs leading-5 text-muted-foreground"
          }
        >
          {invalidRange
            ? "Maximum must be at least the minimum."
            : pricesAvailable
              ? "Uses current exchange rates and store margin. Excludes delivery."
              : "Price filtering is available once exchange rates are configured."}
        </p>
      </fieldset>
    </ListFilters>
  );
}
