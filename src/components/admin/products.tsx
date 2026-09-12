"use client";
import { categoryLabels } from "./category-labels";
import { ProductFilters } from "./product-filters";
import { productFilterDefaults, matchesProduct } from "./filter-models";
import { useCatalog } from "@/components/providers";
import { AdminTable } from "./admin-table";
import { FormSection } from "@/components/shared/form-section";
import { categoryIds } from "../../../shared/categories";
import { ListLoading } from "@/components/shared/loading";
import { ProductPhotoEditor, initialPhotos } from "./product-photo-editor";
import { useRef, useState } from "react";
import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FilterToolbar,
  SearchField,
} from "@/components/shared/collection-controls";
import {
  TranslatedInput,
  TranslatedTextarea,
} from "@/components/shared/language-fields";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
export function AdminProducts() {
  const {
    results: products,
    status,
    loadMore,
  } = usePaginatedQuery(api.catalog.adminPage, {}, { initialNumItems: 20 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(productFilterDefaults);
  const { rates } = useCatalog();
  const visibleProducts = products?.filter(
    (product) =>
      matchesProduct(product, filters, rates) &&
      [
        product.name.en,
        product.name.am,
        product.name.om,
        product.slug,
        product.category,
      ].some((value) =>
        value.toLowerCase().includes(search.trim().toLowerCase()),
      ),
  );
  const [edit, setEdit] = useState<Doc<"products"> | null | undefined>();
  if (status === "LoadingFirstPage")
    return <ListLoading label="Loading products" />;
  return (
    <>
      <div className="admin-title">
        <div>
          <h1>Products</h1>
          <p>
            Manage catalog details, translations, availability, and source
            prices.
          </p>
        </div>
        <Button
          onClick={(event) => {
            triggerRef.current = event.currentTarget;
            setEdit(null);
          }}
        >
          <Plus data-icon="inline-start" />
          Add product
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your collection</CardTitle>
          <CardDescription>
            Search loaded products or browse the next page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FilterToolbar className="mb-5">
            <SearchField
              aria-label="Search loaded products"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search loaded products…"
            />
            <ProductFilters
              value={filters}
              onChange={setFilters}
              pricesAvailable={!!rates}
            />
            {search ? (
              <Button variant="ghost" onClick={() => setSearch("")}>
                Clear
              </Button>
            ) : null}
          </FilterToolbar>
          <AdminTable
            key={JSON.stringify([search, filters])}
            caption="Products"
            rows={visibleProducts ?? []}
            rowKey={(p) => p._id}
            empty="No loaded products match. Adjust filters or use Next to check more records."
            loadMore={status === "CanLoadMore" ? () => loadMore(20) : undefined}
            loadingMore={status === "LoadingMore"}
            columns={[
              { id: "product", label: "Product", cell: (p) => p.name.en },
              {
                id: "category",
                label: "Category",
                cell: (p) => categoryLabels[p.category],
              },
              {
                id: "price",
                label: "Source price",
                align: "right",
                cell: (p) => `${p.sourcePrice} ${p.currency}`,
              },
              {
                id: "stock",
                label: "Available",
                align: "right",
                cell: (p) => Math.max(0, p.stock - p.reserved),
              },
              {
                id: "visibility",
                label: "Visibility",
                cell: (p) => (
                  <Badge variant="secondary">
                    {p.active ? "Published" : "Hidden"}
                  </Badge>
                ),
              },
              {
                id: "edit",
                label: "Actions",
                align: "right",
                cell: (p) => (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${p.name.en}`}
                    onClick={(event) => {
                      triggerRef.current = event.currentTarget;
                      setEdit(p);
                    }}
                  >
                    <Pencil />
                  </Button>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>
      <Sheet
        open={edit !== undefined}
        onOpenChange={(open) => {
          if (!open) setEdit(undefined);
        }}
      >
        <SheetContent
          side="right"
          className="h-dvh w-full gap-0 sm:max-w-2xl"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            triggerRef.current?.focus();
          }}
        >
          <SheetHeader className="shrink-0 border-b p-6 pr-14">
            <SheetTitle>{edit ? "Edit product" : "Add a good find"}</SheetTitle>
            <SheetDescription>
              Prices are converted to Birr using your store rates and margin.
            </SheetDescription>
          </SheetHeader>
          {edit !== undefined ? (
            <ProductForm
              key={edit?._id ?? "new"}
              product={edit}
              close={() => setEdit(undefined)}
            />
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
function ProductForm({
  product: p,
  close,
}: {
  product: Doc<"products"> | null;
  close: () => void;
}) {
  const save = useMutation(api.catalog.save);
  const [photos, setPhotos] = useState(() => initialPhotos(p));
  const [photoPending, setPhotoPending] = useState(false);
  const photosReady =
    !photoPending &&
    photos.length > 0 &&
    photos.every((photo) => photo.status === "ready" && photo.source);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!photosReady) {
          setError(
            "Add at least one photo and finish any uploads before saving.",
          );
          return;
        }
        setBusy(true);
        setError("");
        const d = new FormData(e.currentTarget);
        const str = (key: string) => String(d.get(key) ?? "");
        try {
          await save({
            ...(p ? { id: p._id } : {}),
            slug: str("slug"),
            name: {
              en: str("name-en"),
              am: str("name-am"),
              om: str("name-om"),
            },
            description: {
              en: str("description-en"),
              am: str("description-am"),
              om: str("description-om"),
            },
            category: str("category") as Doc<"products">["category"],
            currency: str("currency") as "USD" | "CNY",
            sourcePrice: Number(d.get("sourcePrice")),
            stock: Number(d.get("stock")),
            reserved: p?.reserved ?? 0,
            image: "",
            images: [],
            photos: photos.map((photo) => photo.source!),
            featured: str("featured") === "yes",
            active: str("active") === "yes",
            updatedAt: Date.now(),
            ...(p?.supplierId ? { supplierId: p.supplierId } : {}),
          });
          toast.success("Product saved");
          close();
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Could not save product",
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      <FieldGroup className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6">
        <ProductPhotoEditor
          photos={photos}
          onChange={setPhotos}
          disabled={busy}
          onPendingChange={setPhotoPending}
        />
        <FormSection>
          <TranslatedInput
            name="name"
            label="Product name"
            required
            defaultValues={p?.name}
          />
          <TranslatedTextarea
            name="description"
            label="Description"
            required
            defaultValues={p?.description}
          />
          <Field>
            <FieldLabel htmlFor="slug">URL slug</FieldLabel>
            <Input
              id="slug"
              name="slug"
              defaultValue={p?.slug}
              placeholder="everyday-canvas-tote"
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              required
            />
          </Field>
        </FormSection>
        <FormSection>
          <SelectField
            name="category"
            label="Category"
            value={p?.category ?? "electronics"}
            options={[...categoryIds]}
          />
          <SelectField
            name="currency"
            label="Source currency"
            value={p?.currency ?? "USD"}
            options={["USD", "CNY"]}
          />
          <Field>
            <FieldLabel htmlFor="sourcePrice">Source price</FieldLabel>
            <Input
              id="sourcePrice"
              name="sourcePrice"
              type="number"
              min="0.01"
              step="0.01"
              defaultValue={p?.sourcePrice}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="stock">Warehouse stock</FieldLabel>
            <Input
              id="stock"
              name="stock"
              type="number"
              min="0"
              step="1"
              defaultValue={p?.stock ?? 0}
              required
            />
          </Field>
        </FormSection>
        <FormSection>
          <SelectField
            name="active"
            label="Published"
            value={p?.active === false ? "no" : "yes"}
            options={["yes", "no"]}
          />
          <SelectField
            name="featured"
            label="Featured in the edit"
            value={p?.featured ? "yes" : "no"}
            options={["yes", "no"]}
          />
        </FormSection>
      </FieldGroup>
      <SheetFooter className="shrink-0 border-t p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={close}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={busy || !photosReady}>
            {busy ? "Saving…" : "Save product"}
          </Button>
        </div>
      </SheetFooter>
    </form>
  );
}
function SelectField({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value: string;
  options: string[];
}) {
  return (
    <Field>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Select name={name} defaultValue={value}>
        <SelectTrigger id={name}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((o) => (
              <SelectItem key={o} value={o}>
                {name === "category"
                  ? categoryLabels[o as keyof typeof categoryLabels]
                  : o}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}
