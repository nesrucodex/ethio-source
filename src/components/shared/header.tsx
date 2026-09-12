"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  ArrowRight,
  LayoutDashboard,
  Globe2,
  Menu,
  Package,
  Search,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { Suspense, useState } from "react";
import { StoreMenu } from "./store-menu";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCatalog, useTranslation } from "@/components/providers";
import { useShop } from "@/stores/shop";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="EthioSource home">
      <span className="brand-mark">
        e
        <span>
          <ArrowUpRight size={14} strokeWidth={3} />
        </span>
      </span>
      <span>
        ethio<span className="font-normal">source</span>
        <span className="brand-dot">.</span>
      </span>
    </Link>
  );
}
export function Header() {
  const { t, locale } = useTranslation();
  const setLocale = useShop((s) => s.setLocale);
  const count = useShop((s) => s.items.reduce((s, i) => s + i.quantity, 0));
  const { viewer } = useCatalog();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/products", label: t("shop") },
    { href: "/how-it-works", label: t("how") },
  ];
  return (
    <>
      <div className="announcement">
        <span>From China to Ethiopia. A simpler way to shop.</span>
        <Link href="/how-it-works">
          Meet EthioSource <ArrowUpRight size={12} />
        </Link>
      </div>
      <header className="site-header">
        <div className="shell header-inner">
          <Brand />
          <nav className="desktop-nav" aria-label="Main navigation">
            {links.map((l) => (
              <Link
                key={l.href}
                className={cn(pathname === l.href && "nav-active")}
                href={l.href}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <div className="language-select">
              <Globe2 size={15} />
              <Select
                value={locale}
                onValueChange={(v) => setLocale(v as Locale)}
              >
                <SelectTrigger aria-label={t("language")} size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="en">EN</SelectItem>
                    <SelectItem value="am">አማ</SelectItem>
                    <SelectItem value="om">OM</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/products" aria-label={t("search")}>
                <Search />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link
                href={viewer ? "/account" : "/sign-in"}
                aria-label={t("account")}
              >
                <UserRound />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link
                href="/cart"
                aria-label={`${t("cart")} (${count})`}
                className="bag-link"
              >
                <ShoppingBag />
                {count > 0 ? <span className="bag-count">{count}</span> : null}
              </Link>
            </Button>
            {viewer?.isAdmin && (
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href="/admin"
                  className="desktop-admin-link"
                  aria-label={t("adminWorkspace")}
                  title={t("adminWorkspace")}
                >
                  <LayoutDashboard />
                </Link>
              </Button>
            )}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mobile-menu"
                  aria-label="Open menu"
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent className="store-menu-sheet">
                <SheetHeader>
                  <SheetTitle>EthioSource</SheetTitle>
                  <SheetDescription>{t("footer")}</SheetDescription>
                </SheetHeader>
                <Suspense fallback={null}>
                  <StoreMenu
                    isAdmin={!!viewer?.isAdmin}
                    onNavigate={() => setOpen(false)}
                  />
                </Suspense>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Brand />
          <p className="mt-5 max-w-xs text-sm text-muted-foreground">
            {t("footer")}
            <br />
            <span className="inline-flex items-center gap-1.5">
              China <ArrowRight size={12} aria-hidden="true" /> Ethiopia.
            </span>
          </p>
        </div>
        <div>
          <h3>Discover</h3>
          <Link href="/products">{t("shop")}</Link>
          <Link href="/products?category=electronics">{t("electronics")}</Link>
          <Link href="/products?category=home">{t("home")}</Link>
        </div>
        <div>
          <h3>Here to help</h3>
          <Link href="/how-it-works">{t("how")}</Link>
          <Link href="/orders">{t("track")}</Link>
          <Link href="/policies">Delivery & returns</Link>
          <Link href="/install">Install EthioSource</Link>
        </div>
        <div>
          <h3>Made for Ethiopia</h3>
          <p>Prices in Ethiopian Birr.</p>
          <p>Secure checkout with Chapa.</p>
          <Link href="/orders" className="inline-flex items-center gap-2">
            <Package size={15} />
            {t("orders")}
          </Link>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} EthioSource</span>
        <span>English · አማርኛ · Afaan Oromoo</span>
        <Link href="/policies">Privacy & terms</Link>
      </div>
    </footer>
  );
}
