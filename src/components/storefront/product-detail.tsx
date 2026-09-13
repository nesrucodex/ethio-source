"use client";
import { ProductGallery } from "./product-gallery";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Truck } from "lucide-react";
import { useCatalog, useTranslation } from "@/components/providers";
import { ProductQuantity } from "./product-quantity";
import { Badge } from "@/components/ui/badge";
import { EmptyState, LoadingCards } from "@/components/shared/states";
import { ProductCard } from "./product-card";
import { money, priceInBirr } from "@/lib/commerce";
export function ProductDetail({ slug }: { slug: string }) {
  const { products, rates } = useCatalog();
  const { t, locale } = useTranslation();
  if (!products)
    return (
      <div className="shell page-content">
        <LoadingCards />
      </div>
    );
  const p = products.find((p) => p.slug === slug);
  if (!p) return <EmptyState title="This product is unavailable" />;
  const available = Math.max(0, p.stock - p.reserved);
  return (
    <div className="shell page-content">
      <Link className="text-link mb-8" href="/products">
        <ArrowLeft size={16} />
        {t("back")}
      </Link>
      <div className="product-detail">
        <ProductGallery
          key={[p._id, p.image, ...(p.images ?? [])].join("|")}
          images={[...new Set([p.image, ...(p.images ?? [])])]}
          name={p.name[locale]}
        />
        <div className="detail-copy">
          <p className="eyebrow">{t(p.category)}</p>
          <h1>{p.name[locale]}</h1>
          <p className="detail-price">
            {rates
              ? money(
                  priceInBirr(
                    p.sourcePrice,
                    p.currency === "USD" ? rates.usd : rates.cny,
                    rates.markup,
                  ),
                )
              : "Price unavailable"}
          </p>
          <Badge variant="secondary">
            {available ? `${available} ${t("available")}` : t("soldOut")}
          </Badge>
          <p className="detail-description">{p.description[locale]}</p>
          <ProductQuantity
            productId={p._id}
            name={p.name[locale]}
            max={rates ? available : 0}
          >
            {available ? t("add") : t("soldOut")}
          </ProductQuantity>
          <div className="detail-notes">
            <p>
              <ShieldCheck size={18} />
              Secure payments in Ethiopian Birr
            </p>
            <p>
              <Truck size={18} />
              Track your shipment from China to pickup
            </p>
          </div>
          <h3>{t("detail")}</h3>
          <p className="text-sm leading-7 text-muted-foreground">
            Imported on order. Delivery is 450 Br, or free on orders from 15,000
            Br. Your order total is confirmed before payment. Arrival dates
            depend on supplier dispatch and customs clearance.
          </p>
        </div>
      </div>
      <section className="section">
        <div className="section-heading">
          <h2>A few more good finds.</h2>
        </div>
        <div className="product-grid">
          {products
            .filter((x) => x._id !== p._id)
            .slice(0, 4)
            .map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
        </div>
      </section>
    </div>
  );
}
