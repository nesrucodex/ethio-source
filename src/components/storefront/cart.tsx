"use client";
import { ProductImage as Image } from "@/components/shared/product-image";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight, LockKeyhole } from "lucide-react";
import { useShop } from "@/stores/shop";
import { useCatalog, useTranslation } from "@/components/providers";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { EmptyState, LoadingCards, Notice } from "@/components/shared/states";
import { money, priceInBirr, shippingFee } from "@/lib/commerce";
export function useCart() {
  const { products, rates } = useCatalog();
  const stored = useShop((s) => s.items);
  const items = stored.map((item) => {
    const product = products?.find((p) => p._id === item.productId);
    return {
      ...item,
      product,
      unitPrice:
        product && rates
          ? priceInBirr(
              product.sourcePrice,
              product.currency === "USD" ? rates.usd : rates.cny,
              rates.markup,
            )
          : 0,
    };
  });
  const subtotal =
    Math.round(items.reduce((s, i) => s + i.unitPrice * i.quantity, 0) * 100) /
    100;
  const shipping = shippingFee(subtotal);
  const invalid = items.some(
    (i) => !i.product || i.product.stock - i.product.reserved < i.quantity,
  );
  return { items, subtotal, shipping, total: subtotal + shipping, invalid };
}
export function OrderSummary({ children }: { children?: React.ReactNode }) {
  const { t } = useTranslation();
  const { subtotal, shipping, total } = useCart();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order summary</CardTitle>
        <CardDescription>A clear price. A simpler checkout.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="summary-line">
          <span>{t("subtotal")}</span>
          <span>{money(subtotal)}</span>
        </div>
        <div className="summary-line">
          <span>{t("shipping")}</span>
          <span>{shipping ? money(shipping) : "Free"}</span>
        </div>
        <div className="summary-line summary-total">
          <span>{t("total")}</span>
          <span>{money(total)}</span>
        </div>
        <p className="text-xs leading-6 text-muted-foreground">
          Delivery is free from 15,000 Br. The server checks final prices and
          stock before you pay.
        </p>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-4">
        {children}
        <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <LockKeyhole size={13} />
          Secure checkout · Chapa
        </p>
      </CardFooter>
    </Card>
  );
}
export function Cart() {
  const { products } = useCatalog();
  const { locale, t } = useTranslation();
  const { items, invalid } = useCart();
  const quantity = useShop((s) => s.quantity);
  const remove = useShop((s) => s.remove);
  if (!products)
    return (
      <div className="shell page-content">
        <LoadingCards />
      </div>
    );
  return (
    <div className="shell page-content">
      <div className="page-heading">
        <p className="eyebrow">A FEW GOOD FINDS</p>
        <h1>{t("cart")}</h1>
        <p>{items.length} items, a little closer to home.</p>
      </div>
      {!items.length ? (
        <EmptyState title={t("empty")} action={t("continue")} />
      ) : (
        <div className="checkout-grid">
          <div>
            {invalid ? (
              <Notice title="Your bag has changed">
                An item is unavailable or the requested quantity exceeds stock.
                Update your bag to continue.
              </Notice>
            ) : null}
            {items.map((i) => (
              <div className="cart-row" key={i.productId}>
                {i.product ? (
                  <Link
                    href={`/products/${i.product.slug}`}
                    className="cart-image"
                  >
                    <Image
                      src={i.product.image}
                      alt={i.product.name[locale]}
                      fill
                      sizes="100px"
                    />
                  </Link>
                ) : null}
                <div className="cart-row-content">
                  <h3>{i.product?.name[locale] ?? "Unavailable product"}</h3>
                  <p className="text-xs text-muted-foreground">
                    {money(i.unitPrice)}
                  </p>
                  <div className="quantity-control">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label={`Decrease ${i.product?.name[locale] ?? "quantity"}`}
                      disabled={i.quantity <= 1}
                      onClick={() => quantity(i.productId, i.quantity - 1)}
                    >
                      <Minus />
                    </Button>
                    <span>{i.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label={`Increase ${i.product?.name[locale] ?? "quantity"}`}
                      disabled={
                        !i.product ||
                        i.quantity >=
                          Math.min(50, i.product.stock - i.product.reserved)
                      }
                      onClick={() => quantity(i.productId, i.quantity + 1)}
                    >
                      <Plus />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${i.product?.name[locale] ?? "item"}`}
                      onClick={() => remove(i.productId)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
                <span className="text-sm font-medium">
                  {money(i.unitPrice * i.quantity)}
                </span>
              </div>
            ))}
          </div>
          <OrderSummary>
            <Button size="lg" disabled={invalid} asChild={!invalid}>
              {invalid ? (
                <span>Update your bag</span>
              ) : (
                <Link href="/checkout">
                  {t("checkout")}
                  <ArrowRight data-icon="inline-end" />
                </Link>
              )}
            </Button>
          </OrderSummary>
        </div>
      )}
    </div>
  );
}
