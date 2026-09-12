"use client";
import { useId, useState, type ReactNode } from "react";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
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

export function ListFilters({
  count,
  onReset,
  children,
}: {
  count: number;
  onReset: () => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          aria-label={count ? `Filters, ${count} active` : "Filters"}
        >
          <SlidersHorizontal data-icon="inline-start" aria-hidden="true" />
          Filters
          {count > 0 && (
            <Badge variant="secondary" aria-hidden="true">
              {count}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="shrink-0 border-b p-6 pr-14">
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>
            Refine loaded records. Next checks more records. Changes apply as
            you go.
          </SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain p-6">
          {children}
        </div>
        <SheetFooter className="shrink-0 border-t p-6">
          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" disabled={!count} onClick={onReset}>
              <RotateCcw data-icon="inline-start" aria-hidden="true" />
              Reset filters
            </Button>
            <SheetClose asChild>
              <Button>Done</Button>
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
export function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
}) {
  const id = useId();
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}
