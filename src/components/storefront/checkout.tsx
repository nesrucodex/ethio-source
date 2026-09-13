"use client";
import { FormLoading } from "@/components/shared/loading";
import { FormSection } from "@/components/shared/form-section";
import { useState } from "react";
import { useMutation, useAction, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useCatalog, useTranslation } from "@/components/providers";
import { useShop } from "@/stores/shop";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, Notice } from "@/components/shared/states";
import { OrderSummary, useCart } from "./cart";
import { Loader2, ArrowUpRight } from "lucide-react";
import { paymentMessage } from "@/lib/payment-message";
export function Checkout() {
  const { viewer, connected } = useCatalog();
  if (!connected)
    return (
      <div className="shell page-content">
        <Notice title="Checkout is not enabled">
          This store is in preview mode. No payment will be taken.
        </Notice>
      </div>
    );
  if (viewer === undefined) return <CheckoutLoading />;
  if (!viewer)
    return (
      <EmptyState
        title="A good find deserves a safe checkout."
        description="Sign in to keep your orders and delivery updates in one place."
        href="/sign-in?next=/checkout"
        action="Sign in to continue"
      />
    );
  return <SavedCheckout key={viewer.id} />;
}
function CheckoutLoading() {
  return (
    <div className="shell page-content">
      <FormLoading label="Preparing checkout" />
    </div>
  );
}
function SavedCheckout() {
  const delivery = useQuery(api.users.deliveryDetails);
  if (delivery === undefined) return <CheckoutLoading />;
  return <CheckoutForm delivery={delivery} />;
}
function CheckoutForm({
  delivery,
}: {
  delivery: { phone: string; address: string } | null;
}) {
  const { viewer } = useCatalog();
  const { t } = useTranslation();
  const { items, invalid } = useCart();
  const clear = useShop((s) => s.clear);
  const create = useMutation(api.orders.create);
  const start = useAction(api.payments.start);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  if (!items.length && !busy) return <EmptyState title="Your bag is empty" />;
  return (
    <div className="shell page-content">
      <div className="page-heading">
        <p className="eyebrow">ONE STEP CLOSER</p>
        <h1>Checkout</h1>
        <p>Local payments. Peace of mind.</p>
      </div>
      <div className="checkout-grid">
        <form
          id="checkout"
          onSubmit={async (e) => {
            e.preventDefault();
            if (busy || invalid) return;
            setBusy(true);
            setError("");
            const form = new FormData(e.currentTarget);
            let id: Id<"orders"> | undefined;
            try {
              id = await create({
                items: items.map((i) => ({
                  productId: i.productId as Id<"products">,
                  quantity: i.quantity,
                })),
                name: String(form.get("name")),
                email: String(form.get("email")),
                phone: String(form.get("phone")),
                address: String(form.get("address")),
              });
              const url = await start({ id });
              clear();
              window.location.assign(url);
            } catch (err) {
              if (id) {
                clear();
                router.push("/payment/" + encodeURIComponent(id));
              } else
                setError(
                  paymentMessage(err, "Checkout failed. Please try again."),
                );
            } finally {
              setBusy(false);
            }
          }}
        >
          <h2 className="mb-6 text-xl">{t("contact")}</h2>
          <FieldGroup>
            <FormSection>
              <Field>
                <FieldLabel htmlFor="name">Full name</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  placeholder="Your name"
                  autoComplete="name"
                  defaultValue={viewer?.name}
                  required
                  minLength={2}
                  maxLength={100}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email address</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  type="email"
                  autoComplete="email"
                  defaultValue={viewer?.email}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Ethiopian mobile number</FieldLabel>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  defaultValue={delivery?.phone}
                  placeholder="0911234567"
                  pattern="(\+?251[79][0-9]{8}|0[79][0-9]{8})"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="address">
                  City, sub-city & delivery address
                </FieldLabel>
                <Textarea
                  id="address"
                  name="address"
                  autoComplete="street-address"
                  defaultValue={delivery?.address}
                  placeholder="Addis Ababa, Bole, building or nearby landmark"
                  minLength={8}
                  maxLength={500}
                  required
                />
              </Field>
            </FormSection>
            {delivery ? (
              <p className="text-xs leading-6 text-muted-foreground">
                Delivery details from your last paid order. You can change them
                for this delivery.
              </p>
            ) : null}
            <Notice title="Pay with Chapa">
              Available local payment methods are shown on Chapa’s secure
              checkout. Your order is confirmed only after payment verification.
            </Notice>
            <p className="text-xs leading-6 text-muted-foreground">
              Inventory is reserved for 30 minutes. Customs and supplier
              dispatch affect arrival dates. Review our delivery and returns
              policy before paying.
            </p>
            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}
            {invalid ? (
              <Notice title="Update your bag">
                Some items are unavailable. Return to your bag before checking
                out.
              </Notice>
            ) : null}
          </FieldGroup>
        </form>
        <OrderSummary>
          <Button
            form="checkout"
            type="submit"
            size="lg"
            disabled={busy || invalid}
          >
            {busy ? (
              <Loader2 className="animate-spin" data-icon="inline-start" />
            ) : (
              <ArrowUpRight data-icon="inline-end" />
            )}
            {busy ? "Preparing secure checkout…" : t("pay")}
          </Button>
        </OrderSummary>
      </div>
    </div>
  );
}
