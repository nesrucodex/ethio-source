"use client";
import { ProductImage as Image } from "@/components/shared/product-image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { ProductQuantity } from "./product-quantity";
import { useCatalog, useTranslation } from "@/components/providers";
import { money, priceInBirr } from "@/lib/commerce";
import type { Doc } from "../../../convex/_generated/dataModel";
export function ProductCard({ product }: { product: Doc<"products"> }) {
  const { locale, t } = useTranslation();
  const { rates } = useCatalog();
  const available = Math.max(0, product.stock - product.reserved);
  return (
    <motion.article
      className="product-card"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", bounce: 0, duration: 0.3 }}
    >
      <Link href={`/products/${product.slug}`} className="product-image">
        <Image
          src={product.image}
          alt={product.name[locale]}
          fill
          sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
        />
        <div className="product-badges">
          {!available ? (
            <Badge variant="secondary">{t("soldOut")}</Badge>
          ) : product.featured ? (
            <Badge variant="secondary">The edit</Badge>
          ) : null}
        </div>
        <span className="product-peek">
          <ArrowUpRight size={18} />
        </span>
      </Link>
      <div className="product-info">
        <div>
          <p className="product-category">{t(product.category)}</p>
          <Link href={`/products/${product.slug}`}>
            <h3>{product.name[locale]}</h3>
          </Link>
        </div>
        <div className="product-purchase">
          <p className="product-price">
            {rates
              ? money(
                  priceInBirr(
                    product.sourcePrice,
                    product.currency === "USD" ? rates.usd : rates.cny,
                    rates.markup,
                  ),
                )
              : "Price unavailable"}
          </p>
          <ProductQuantity
            productId={product._id}
            name={product.name[locale]}
            max={rates ? available : 0}
          />
        </div>
      </div>
    </motion.article>
  );
}
