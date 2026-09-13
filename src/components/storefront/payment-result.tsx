"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAction, useQuery } from "convex/react";
import {
  CircleCheck,
  CircleX,
  Clock,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { useCatalog } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingRegion } from "@/components/shared/loading";
import { EmptyState } from "@/components/shared/states";
import { money } from "@/lib/commerce";
import { paymentMessage } from "@/lib/payment-message";

function PaymentLoading() {
  return (
    <LoadingRegion
      label="Loading payment status"
      className="mx-auto w-full max-w-lg py-16"
    >
      <Skeleton className="mx-auto mb-6 size-16 rounded-2xl" />
      <Skeleton className="mx-auto mb-4 h-9 w-64" />
      <Skeleton className="mx-auto h-16 w-full" />
    </LoadingRegion>
  );
}

export function PaymentResult({ reference }: { reference: string }) {
  const { connected, viewer } = useCatalog();
  if (connected && viewer === undefined) return <PaymentLoading />;
  if (!connected || !viewer) {
    const next = "/payment/" + encodeURIComponent(reference);
    return (
      <EmptyState
        title="Your payment, securely tracked."
        description="Sign in to see the verified result for your order."
        href={"/sign-in?next=" + encodeURIComponent(next)}
        action="Sign in to view payment"
      />
    );
  }
  return <PaymentStatus key={reference} reference={reference} />;
}

function PaymentStatus({ reference }: { reference: string }) {
  const order = useQuery(api.orders.paymentSummary, { reference });
  const recheck = useAction(api.payments.recheck);
  const start = useAction(api.payments.start);
  const [requestBusy, setBusy] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");

  const orderId = order?.id;
  const needsVerification =
    !!order?.checkoutStarted &&
    !["paid", "review"].includes(order.paymentStatus);
  const busy = requestBusy || (needsVerification && !verified);
  useEffect(() => {
    if (!orderId || !needsVerification) return;
    let active = true;
    void recheck({ id: orderId })
      .catch(() => {
        if (active)
          setError(
            "We couldn’t confirm the payment yet. Check again shortly; you don’t need to pay again.",
          );
      })
      .finally(() => {
        if (active) setVerified(true);
      });
    return () => {
      active = false;
    };
  }, [orderId, needsVerification, recheck]);

  if (order === undefined) return <PaymentLoading />;
  if (!order)
    return (
      <EmptyState
        title="Payment not found"
        description="This payment isn’t available for your account. Find your order to continue."
        href="/orders"
        action="View your orders"
      />
    );

  const paid = order.paymentStatus === "paid";
  const failed =
    order.paymentStatus === "failed" || order.paymentStatus === "expired";
  const review = order.paymentStatus === "review";
  const checkoutFailed = !order.checkoutStarted && !!order.paymentError;
  const Icon = paid
    ? CircleCheck
    : failed || checkoutFailed
      ? CircleX
      : review
        ? ShieldCheck
        : Clock;
  const title = paid
    ? "Payment successful."
    : review
      ? "Your payment needs a review."
      : order.paymentStatus === "expired"
        ? "Your checkout has expired."
        : failed
          ? "Payment unsuccessful."
          : checkoutFailed
            ? "We couldn’t open checkout."
            : busy
              ? "Checking your payment…"
              : "Payment awaiting confirmation.";
  const description = paid
    ? "Your payment is verified and your order is confirmed. Follow its progress in your orders."
    : review
      ? "Our team will check your payment and order. Please don’t make another payment for this order."
      : failed
        ? "Your order hasn’t been confirmed. If you were charged, check the payment status before placing another order."
        : checkoutFailed
          ? "Your order is saved. You can try opening Chapa again without creating another order."
          : "We’re waiting for a verified result from Chapa. This page updates when confirmation arrives.";

  async function payment(retry: boolean) {
    if (!order || busy) return;
    setBusy(true);
    setError("");
    try {
      if (retry) window.location.assign(await start({ id: order.id }));
      else await recheck({ id: order.id });
    } catch (err) {
      setError(
        paymentMessage(
          err,
          retry
            ? "We couldn’t open Chapa. Try again shortly."
            : "We couldn’t confirm the payment yet. Please check again shortly.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="shell page-content">
      <Card className="mx-auto max-w-lg rounded-3xl shadow-sm">
        <CardContent className="flex flex-col items-center gap-6 px-6 py-10 text-center sm:px-10">
          <div
            className={`flex size-16 items-center justify-center rounded-2xl ${failed || checkoutFailed ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}
          >
            <Icon className="size-8" strokeWidth={1.5} aria-hidden="true" />
          </div>
          <div role="status" aria-live="polite" className="space-y-3">
            <p className="eyebrow">YOUR PAYMENT</p>
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="w-full rounded-2xl bg-muted/50 p-4">
            <p className="text-2xl font-semibold tracking-tight">
              {money(order.total)}
            </p>
            <p className="mt-2 break-all text-xs text-muted-foreground">
              Reference: {order.reference}
            </p>
          </div>
          {error && !paid && !review ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <div className="flex w-full flex-col gap-3">
            <Button asChild size="lg">
              <Link href="/orders">Continue to your orders</Link>
            </Button>
            {!paid && !review && order.checkoutStarted ? (
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => void payment(false)}
              >
                {busy ? "Checking payment…" : "Check payment status"}
              </Button>
            ) : null}
            {order.paymentStatus === "pending" ? (
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => void payment(true)}
              >
                Continue to Chapa <ArrowUpRight aria-hidden="true" />
              </Button>
            ) : null}
            {paid || failed ? (
              <Button variant="ghost" asChild>
                <Link href="/products">Continue browsing</Link>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
