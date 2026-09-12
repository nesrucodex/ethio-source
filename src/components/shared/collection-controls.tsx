import type { ComponentProps } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import "./collection-controls.css";

// The caller owns search/filter state; children compose the controls it needs.
export function FilterToolbar({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="filter-toolbar"
      className={cn("filter-toolbar", className)}
      {...props}
    />
  );
}

export function SearchField({
  className,
  ...props
}: Omit<ComponentProps<typeof Input>, "type">) {
  return (
    <div data-slot="search-field" className={cn("search-control", className)}>
      <Search size={18} strokeWidth={1.75} aria-hidden="true" />
      <Input {...props} type="search" />
    </div>
  );
}
