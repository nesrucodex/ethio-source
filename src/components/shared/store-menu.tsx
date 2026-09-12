"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  Route,
  Package,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "@/components/providers";
const destinations = [
  { href: "/products", label: "shop", icon: ShoppingBag },
  { href: "/how-it-works", label: "how", icon: Route },
  { href: "/orders", label: "orders", icon: Package },
] as const;
export function StoreMenu({
  isAdmin,
  onNavigate,
}: {
  isAdmin: boolean;
  onNavigate: () => void;
}) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const items = isAdmin
    ? [
        ...destinations,
        {
          href: "/admin",
          label: "adminWorkspace" as const,
          icon: LayoutDashboard,
        },
      ]
    : destinations;
  return (
    <nav className="store-menu-nav" aria-label={t("menu")}>
      {items.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="store-menu-item"
          data-admin={href === "/admin" || undefined}
          aria-current={pathname === href ? "page" : undefined}
          onNavigate={onNavigate}
        >
          <span className="store-menu-icon">
            <Icon size={19} strokeWidth={1.6} aria-hidden="true" />
          </span>
          <span>{t(label)}</span>
          <ChevronRight
            className="store-menu-chevron"
            size={16}
            aria-hidden="true"
          />
        </Link>
      ))}
    </nav>
  );
}
