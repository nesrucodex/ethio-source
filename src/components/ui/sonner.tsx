"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  CircleXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { cn } from "@/lib/utils";
import "./sonner.css";

function Toaster({ className, icons, ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      className={cn("app-toaster", className)}
      closeButton
      gap={12}
      icons={{
        success: (
          <CircleCheckIcon size={18} strokeWidth={1.75} aria-hidden="true" />
        ),
        info: <InfoIcon size={18} strokeWidth={1.75} aria-hidden="true" />,
        warning: (
          <TriangleAlertIcon size={18} strokeWidth={1.75} aria-hidden="true" />
        ),
        error: <CircleXIcon size={18} strokeWidth={1.75} aria-hidden="true" />,
        loading: (
          <Loader2Icon
            size={18}
            strokeWidth={1.75}
            className="toast-spinner"
            aria-hidden="true"
          />
        ),
        ...icons,
      }}
      {...props}
    />
  );
}
export { Toaster };
