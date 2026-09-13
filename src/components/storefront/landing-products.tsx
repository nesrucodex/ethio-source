"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useCatalog, useTranslation } from "@/components/providers";
import { ProductImage } from "@/components/shared/product-image";
import { LoadingCards, Notice, EmptyState } from "@/components/shared/states";
import { LoadingRegion } from "@/components/shared/loading";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "./product-card";
import { landingCopy } from "@/lib/landing-copy";
export function LandingSpotlight() {
  const { products } = useCatalog();
  const { locale, t } = useTranslation();
  const main = products?.find((p) => p.featured) ?? products?.[0];
  if (!products)
    return (
      <LoadingRegion className="landing-spotlight" label="Loading collection">
        <Skeleton className="aspect-[4/4.5] rounded-xl" />
        <Skeleton className="mt-5 h-5 w-2/3" />
      </LoadingRegion>
    );
  if (!main)
    return (
      <div className="landing-spotlight landing-spotlight-empty">
        <span lang="zh">中国</span>
        <ArrowUpRight />
        <span lang="am">ኢትዮጵያ</span>
        <p>{landingCopy[locale].connection}</p>
      </div>
    );
  return (
    <div className="landing-spotlight">
      <Link href={`/products/${main.slug}`} className="spotlight-main">
        <div className="spotlight-image">
          <ProductImage
            src={main.image}
            alt={main.name[locale]}
            fill
            priority
            sizes="(max-width:640px) 100vw, 50vw"
          />
          <span className="spotlight-tag">{t("selected")}</span>
        </div>
        <span className="spotlight-caption">
          <span>
            <small>{landingCopy[locale].edit}</small>
            <strong>{main.name[locale]}</strong>
          </span>
          <ArrowUpRight size={24} />
        </span>
      </Link>
    </div>
  );
}
export function LandingCollection() {
  const { products, connected, rates } = useCatalog();
  const featured = products?.filter((p) => p.featured).slice(0, 4);
  const displayed = featured?.length ? featured : products?.slice(0, 4);
  return (
    <>
      {!connected || rates?.source.startsWith("Sample") ? (
        <div className="mb-6">
          <Notice title="Preview collection">
            Sample products and prices. Live checkout requires store and payment
            setup.
          </Notice>
        </div>
      ) : null}
      {!displayed ? (
        <LoadingCards />
      ) : displayed.length ? (
        <div className="product-grid">
          {displayed.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="The next collection is on its way"
          description="Check back soon for new finds."
        />
      )}
    </>
  );
}
