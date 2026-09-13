"use client";

import type { ReactNode } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShop } from "@/stores/shop";

export function ProductQuantity({
  productId,
  name,
  max,
  children,
}: {
  productId: string;
  name: string;
  max: number;
  children?: ReactNode;
}) {
  const count = useShop(
    (s) => s.items.find((item) => item.productId === productId)?.quantity ?? 0,
  );
  const add = useShop((s) => s.add);
  function decrease() {
    // Read on click so rapid taps cannot reuse a stale rendered count.
    const shop = useShop.getState();
    const current =
      shop.items.find((item) => item.productId === productId)?.quantity ?? 0;
    if (current <= 1) shop.remove(productId);
    else shop.quantity(productId, current - 1);
  }
  return (
    <div
      className="product-quantity"
      role="group"
      aria-label={`Bag quantity: ${name}`}
      data-filled={count > 0}
    >
      {count > 0 ? (
        <>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Decrease quantity: ${name}`}
            onClick={decrease}
          >
            <Minus aria-hidden="true" />
          </Button>
          <output aria-label={`${name} in bag`} aria-live="polite">
            {count}
          </output>
        </>
      ) : null}
      <Button
        variant={count ? "ghost" : "outline"}
        size={children && !count ? "default" : "icon"}
        disabled={count >= Math.min(max, 50)}
        aria-label={`${count ? "Increase quantity" : "Add to bag"}: ${name}`}
        onClick={() => add(productId, max)}
      >
        <Plus aria-hidden="true" />
        {!count ? children : null}
      </Button>
    </div>
  );
}
