"use client";
import { AdminTable, adminDateTime } from "./admin-table";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { FormSection } from "@/components/shared/form-section";
import { ListLoading } from "@/components/shared/loading";
import { useState } from "react";
import { usePaginatedQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";

import { money, stages, stageLabels } from "@/lib/commerce";
export function AdminOrders() {
  const {
    results: orders,
    status,
    loadMore,
  } = usePaginatedQuery(api.orders.adminPage, {}, { initialNumItems: 20 });
  if (status === "LoadingFirstPage")
    return <ListLoading label="Loading orders and cargo" />;
  return (
    <>
      <div className="admin-title">
        <div>
          <h1>Orders & cargo</h1>
          <p>Advance verified orders one stage at a time.</p>
        </div>
      </div>
      <AdminTable
        caption="Orders"
        rows={orders}
        rowKey={(o) => o._id}
        loadMore={status === "CanLoadMore" ? () => loadMore(20) : undefined}
        loadingMore={status === "LoadingMore"}
        columns={[
          { id: "reference", label: "Reference", cell: (o) => o.reference },
          { id: "customer", label: "Customer", cell: (o) => o.name },
          {
            id: "total",
            label: "Total",
            align: "right",
            cell: (o) => money(o.total),
          },
          {
            id: "payment",
            label: "Payment",
            cell: (o) => (
              <Badge
                variant={o.paymentStatus === "paid" ? "default" : "secondary"}
              >
                {o.paymentStatus}
              </Badge>
            ),
          },
          {
            id: "cargo",
            label: "Cargo",
            cell: (o) =>
              o.paymentStatus === "paid"
                ? stageLabels[o.stage]
                : "Awaiting payment",
          },
          {
            id: "actions",
            label: "Actions",
            align: "right",
            cell: (o) => (
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`View order ${o.reference}`}
                  >
                    View order
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Order details</SheetTitle>
                    <SheetDescription>
                      Review items, payment and cargo progress.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="px-4 pb-4">
                    <CargoOrder order={o} />
                  </div>
                </SheetContent>
              </Sheet>
            ),
          },
        ]}
      />
    </>
  );
}
function CargoOrder({ order: o }: { order: Doc<"orders"> }) {
  const advance = useMutation(api.orders.advance);
  const [busy, setBusy] = useState(false);
  const next = stages[stages.indexOf(o.stage) + 1];
  return (
    <Card className="mb-5">
      <CardHeader>
        <div className="order-top">
          <div>
            <CardTitle>
              {o.reference.slice(0, 11).toUpperCase()} · {o.name}
            </CardTitle>
            <CardDescription className="mt-2">
              {o.email} · {o.phone} · {money(o.total)}
            </CardDescription>
          </div>
          <Badge variant={o.paymentStatus === "paid" ? "default" : "secondary"}>
            {o.paymentStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-sm">{o.address}</p>
        {o.items.map((i) => (
          <p key={i.productId} className="text-xs text-muted-foreground">
            {i.name} × {i.quantity}
          </p>
        ))}
        {o.events.map((e) => (
          <p key={e.stage} className="mt-3 text-xs">
            {stageLabels[e.stage]} · {adminDateTime.format(e.at)} · {e.note}
          </p>
        ))}
        {o.paymentError ? (
          <p className="mt-3 text-xs text-destructive">{o.paymentError}</p>
        ) : null}
      </CardContent>
      <CardFooter>
        {o.paymentStatus === "paid" && next ? (
          <form
            className="flex w-full flex-wrap items-end gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const note = String(new FormData(form).get("note"));
              setBusy(true);
              try {
                await advance({ id: o._id, stage: next, note });
                form.reset();
                toast.success("Cargo status updated");
              } catch {
                toast.error("Could not update this order");
              } finally {
                setBusy(false);
              }
            }}
          >
            <FormSection className="min-w-48 flex-1">
              <Field>
                <FieldLabel htmlFor={`note-${o._id}`}>Tracking note</FieldLabel>
                <Input
                  id={`note-${o._id}`}
                  name="note"
                  maxLength={500}
                  required
                  placeholder="Carrier reference, location, or pickup instructions"
                />
              </Field>
            </FormSection>
            <Button disabled={busy} type="submit">
              Mark {stageLabels[next].toLowerCase()}
            </Button>
          </form>
        ) : (
          <p className="text-xs text-muted-foreground">
            {o.paymentStatus === "paid"
              ? "Ready for the customer to collect."
              : "Cargo updates are available after verified payment."}
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
