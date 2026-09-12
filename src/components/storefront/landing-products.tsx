"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useCatalog, useTranslation } from "@/components/providers";
import { ProductImage } from "@/components/shared/product-image";
import { LoadingCards, Notice, EmptyState } from "@/components/shared/states";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "./product-card";
import { landingCopy } from "@/lib/landing-copy";
export function LandingSpotlight() {
  const { products } = useCatalog();
  const { locale, t } = useTranslation();
  const picks = products?.filter((p) => p.featured).slice(0, 2);
  const main = picks?.[0] ?? products?.[0];
  const secondary = picks?.[1];
  if (!products)
    return (
      <div
        className="landing-spotlight"
        role="status"
        aria-label="Loading collection"
      >
        <Skeleton className="absolute inset-0 rounded-3xl" />
      </div>
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
        <ProductImage
          src={main.image}
          alt={main.name[locale]}
          fill
          priority
          sizes="(max-width:640px) 100vw, 50vw"
        />
        <div className="spotlight-shade" />
        <span className="spotlight-tag">{t("selected")}</span>
        <span className="spotlight-caption">
          <span>
            <small>{landingCopy[locale].edit}</small>
            <strong>{main.name[locale]}</strong>
          </span>
          <ArrowUpRight size={24} />
        </span>
      </Link>
      {secondary && (
        <Link
          className="spotlight-secondary"
          href={`/products/${secondary.slug}`}
        >
          <div>
            <ProductImage
              src={secondary.image}
              alt={secondary.name[locale]}
              fill
              sizes="(max-width:640px) 120px, 180px"
            />
          </div>
          <span>
            {secondary.name[locale]}
            <ArrowUpRight size={16} />
          </span>
        </Link>
      )}
      <div className="spotlight-seal" aria-label="China to Ethiopia">
        <span lang="zh">中</span>
        <span>
          CN <ArrowUpRight size={12} aria-hidden="true" /> ET
        </span>
        <span lang="am">ኢ</span>
      </div>
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
