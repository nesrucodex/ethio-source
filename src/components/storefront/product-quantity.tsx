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
  const quantity = useShop((s) => s.quantity);
  const remove = useShop((s) => s.remove);
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
            onClick={() =>
              count === 1 ? remove(productId) : quantity(productId, count - 1)
            }
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
