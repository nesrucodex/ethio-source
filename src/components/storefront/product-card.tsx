"use client";
import { ProductImage as Image } from "@/components/shared/product-image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCatalog, useTranslation } from "@/components/providers";
import { useShop } from "@/stores/shop";
import { money, priceInBirr } from "@/lib/commerce";
import type { Doc } from "../../../convex/_generated/dataModel";
export function ProductCard({ product }: { product: Doc<"products"> }) {
  const router = useRouter();
  const { locale, t } = useTranslation();
  const { rates } = useCatalog();
  const add = useShop((s) => s.add);
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
        </div>
        <Button
          variant="outline"
          size="icon"
          disabled={!available || !rates}
          aria-label={`${t("add")}: ${product.name[locale]}`}
          onClick={() => {
            add(product._id, available);
            toast.success(t("add"), {
              description: product.name[locale],
              action: { label: t("cart"), onClick: () => router.push("/cart") },
            });
          }}
        >
          <Plus />
        </Button>
      </div>
    </motion.article>
  );
}
