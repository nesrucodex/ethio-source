"use client";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { ConvexReactClient, useQuery } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { MotionConfig } from "motion/react";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { env } from "@/config/env";
import { useShop } from "@/stores/shop";
import { sampleProducts } from "@/lib/catalog-data";
import { translations, type TranslationKey } from "@/lib/i18n";
import { Toaster } from "@/components/ui/sonner";

type Viewer = {
  id: Id<"users">;
  name: string;
  email: string;
  isAdmin: boolean;
} | null;
type Catalog = {
  products: Doc<"products">[] | undefined;
  rates:
    | { usd: number; cny: number; markup: number; source: string }
    | null
    | undefined;
  viewer: Viewer | undefined;
  connected: boolean;
};
const CatalogContext = createContext<Catalog>({
  products: undefined,
  rates: undefined,
  viewer: undefined,
  connected: false,
});
function LiveData({ children }: { children: React.ReactNode }) {
  const products = useQuery(api.catalog.list);
  const rates = useQuery(api.catalog.rates);
  const viewer = useQuery(api.users.me);
  return (
    <CatalogContext value={{ products, rates, viewer, connected: true }}>
      {children}
    </CatalogContext>
  );
}
const preview: Catalog = {
  products: sampleProducts.map((p, i) => ({
    ...p,
    _id: `preview-${i}` as Id<"products">,
    _creationTime: 0,
    reserved: 0,
    active: true,
    updatedAt: 0,
  })),
  rates: { usd: 150, cny: 21, markup: 15, source: "Sample rates" },
  viewer: null,
  connected: false,
};
export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() =>
    env.NEXT_PUBLIC_CONVEX_URL
      ? new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL)
      : null,
  );
  useEffect(() => {
    void useShop.persist.rehydrate();
  }, []);
  const locale = useShop((s) => s.locale);
  const pathname = usePathname();
  const pageLanguage =
    pathname === "/admin" || pathname.startsWith("/admin/") ? "en" : locale;
  useEffect(() => {
    document.documentElement.lang = pageLanguage;
  }, [pageLanguage]);
  return (
    <MotionConfig reducedMotion="user">
      {client ? (
        <ConvexAuthProvider client={client}>
          <LiveData>{children}</LiveData>
        </ConvexAuthProvider>
      ) : (
        <CatalogContext value={preview}>{children}</CatalogContext>
      )}
      <Toaster position="bottom-right" />
    </MotionConfig>
  );
}
export function useCatalog() {
  return useContext(CatalogContext);
}
export function useTranslation() {
  const locale = useShop((s) => s.locale);
  return { locale, t: (key: TranslationKey) => translations[locale][key] };
}
