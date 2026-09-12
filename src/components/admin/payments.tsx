"use client";
import { ListLoading } from "@/components/shared/loading";
import { usePaginatedQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { money } from "@/lib/commerce";
import { AdminTable } from "./admin-table";
const filters = [
  "all",
  "paid",
  "pending",
  "failed",
  "expired",
  "review",
] as const;
export function Payments() {
  const [filter, setFilter] = useState("all");
  return (
    <>
      <div className="admin-title">
        <div>
          <h1>Payments</h1>
          <p>
            Verified by Chapa. Payment states cannot be manually marked as paid.
          </p>
        </div>
      </div>
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="mb-5 flex-wrap h-auto">
          {filters.map((value) => (
            <TabsTrigger key={value} value={value}>
              {value}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={filter}>
          <PaymentLedger
            key={filter}
            status={
              filter === "all"
                ? undefined
                : (filter as Doc<"orders">["paymentStatus"])
            }
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
function PaymentLedger({
  status: paymentStatus,
}: {
  status?: Doc<"orders">["paymentStatus"];
}) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.orders.adminPage,
    { status: paymentStatus },
    { initialNumItems: 20 },
  );
  if (status === "LoadingFirstPage")
    return <ListLoading label="Loading payments" />;
  return (
    <AdminTable
      caption="Payments"
      rows={results}
      rowKey={(o) => o._id}
      empty="No transactions in this category."
      loadMore={status === "CanLoadMore" ? () => loadMore(20) : undefined}
      loadingMore={status === "LoadingMore"}
      columns={[
        { id: "reference", label: "Reference", cell: (o) => o.reference },
        { id: "customer", label: "Customer", cell: (o) => o.name },
        {
          id: "amount",
          label: "Amount",
          align: "right",
          cell: (o) => money(o.total),
        },
        {
          id: "status",
          label: "Status",
          cell: (o) => (
            <Badge
              variant={o.paymentStatus === "paid" ? "default" : "secondary"}
            >
              {o.paymentStatus}
            </Badge>
          ),
        },
        {
          id: "notes",
          label: "Notes",
          cell: (o) => o.paymentError ?? "No issues reported",
        },
      ]}
    />
  );
}
