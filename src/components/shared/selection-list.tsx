import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import "./selection-list.css";

export function SelectionList({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("selection-list", className)} {...props} />;
}
function SelectionContent({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <>
      <Icon
        className="selection-icon"
        size={19}
        strokeWidth={1.6}
        aria-hidden="true"
      />
      <span className="selection-label">{children}</span>
      <Check
        className="selection-check"
        size={17}
        strokeWidth={2}
        aria-hidden="true"
      />
    </>
  );
}
export function SelectionRadio({
  icon,
  children,
  ...props
}: Omit<ComponentProps<"input">, "type" | "children"> & {
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <label className="selection-row">
      <input {...props} type="radio" className="selection-input" />
      <SelectionContent icon={icon}>{children}</SelectionContent>
    </label>
  );
}
export function SelectionLink({
  icon,
  children,
  className,
  ...props
}: ComponentProps<typeof Link> & { icon: LucideIcon }) {
  return (
    <Link {...props} className={cn("selection-row", className)}>
      <SelectionContent icon={icon}>{children}</SelectionContent>
    </Link>
  );
}
