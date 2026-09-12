import type { ComponentProps } from "react";
import { FieldGroup } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import "./form-section.css";

/** A single inset surface for related fields; labels and controls stay native. */
export function FormSection({
  className,
  ...props
}: ComponentProps<typeof FieldGroup>) {
  return <FieldGroup className={cn("form-section", className)} {...props} />;
}
