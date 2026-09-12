"use client";
import { ListLoading } from "@/components/shared/loading";
import { useQuery, useAction } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import { useCatalog } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { EmptyState, Notice } from "@/components/shared/states";
import { money, stages, stageLabels } from "@/lib/commerce";
import { cn } from "@/lib/utils";
export function Orders() {
  const { viewer, connected } = useCatalog();
  if (!connected || viewer === null)
    return (
      <EmptyState
        title="Every step, all in one place."
        description="Sign in to track your orders from China to Ethiopia."
        href="/sign-in?next=/orders"
        action="Sign in to track"
      />
    );
  if (!viewer)
    return (
      <div className="shell page-content">
        <ListLoading label="Loading your orders" />
      </div>
    );
  return <OrderList />;
}
function OrderList() {
  const orders = useQuery(api.orders.mine);
  return (
    <div className="shell page-content">
      <div className="page-heading">
        <p className="eyebrow">FROM THERE TO HERE</p>
        <h1>Your orders.</h1>
        <p>Real-time updates. A clearer journey.</p>
      </div>
      {orders ? (
        orders.length ? (
          orders.map((o) => <OrderCard key={o._id} order={o} />)
        ) : (
          <EmptyState
            title="Your first good find is out there."
            description="Your orders will appear here after checkout."
          />
        )
      ) : (
        <ListLoading label="Loading your orders" />
      )}
    </div>
  );
}
function OrderCard({ order: o }: { order: Doc<"orders"> }) {
  const start = useAction(api.payments.start);
  const recheck = useAction(api.payments.recheck);
  const [busy, setBusy] = useState(false);
  async function payment(retry: boolean) {
    setBusy(true);
    try {
      if (retry) window.location.assign(await start({ id: o._id }));
      else {
        await recheck({ id: o._id });
        toast.success("Payment status checked");
      }
    } catch {
      toast.error("Could not reach the payment provider. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Card className="order-card">
      <CardHeader>
        <div className="order-top">
          <div>
            <CardTitle>{o.reference.slice(0, 11).toUpperCase()}</CardTitle>
            <CardDescription className="mt-2">
              {new Date(o._creationTime).toLocaleDateString()} ·{" "}
              {o.items.length} items · {money(o.total)}
            </CardDescription>
          </div>
          <Badge variant={o.paymentStatus === "paid" ? "default" : "secondary"}>
            {o.paymentStatus === "review"
              ? "Payment needs review"
              : o.paymentStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {o.paymentStatus === "paid" ? (
          <div className="tracking">
            {stages.map((s) => {
              const event = o.events.find((e) => e.stage === s);
              return (
                <div
                  key={s}
                  className={cn("tracking-step", !!event && "complete")}
                >
                  <h4>{stageLabels[s]}</h4>
                  <p>
                    {event
                      ? new Date(event.at).toLocaleDateString()
                      : "Coming up"}
                  </p>
                  {event ? <p>{event.note}</p> : null}
                </div>
              );
            })}
          </div>
        ) : (
          <Notice
            title={
              o.paymentStatus === "pending"
                ? "Waiting for payment confirmation"
                : o.paymentStatus === "review"
                  ? "Our team needs to review this payment"
                  : "Payment not completed"
            }
          >
            {o.paymentStatus === "review"
              ? "Please contact the store before making another payment."
              : "Your cargo journey starts after payment has been verified. Returning from checkout does not confirm payment."}
          </Notice>
        )}
        <div className="mt-5 flex flex-col gap-2">
          {o.items.map((i) => (
            <div
              key={i.productId}
              className="flex justify-between gap-4 text-sm"
            >
              <span>
                {i.name} × {i.quantity}
              </span>
              <span>{money(i.unitPrice * i.quantity)}</span>
            </div>
          ))}
        </div>
        <p className="mt-5 text-xs text-muted-foreground">
          Delivery to: {o.name} · {o.address}
        </p>
        {o.paymentError ? (
          <p className="mt-4 text-xs text-destructive">{o.paymentError}</p>
        ) : null}
      </CardContent>
      <CardFooter className="gap-3">
        {o.paymentStatus === "pending" ? (
          <Button disabled={busy} onClick={() => void payment(true)}>
            Continue payment
          </Button>
        ) : null}
        {o.paymentStatus !== "paid" ? (
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => void payment(false)}
          >
            Check payment status
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
