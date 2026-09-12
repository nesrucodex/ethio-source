"use client";
import { AdminTable } from "./admin-table";
import { DashboardLoading } from "@/components/shared/loading";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { money, stageLabels } from "@/lib/commerce";
import { useCatalog } from "@/components/providers";
export function Dashboard() {
  const orders = useQuery(api.orders.all);
  const products = useQuery(api.catalog.adminList);
  const { viewer } = useCatalog();
  if (orders === undefined || products === undefined)
    return <DashboardLoading />;
  const paid = orders?.filter((o) => o.paymentStatus === "paid") ?? [];
  return (
    <>
      <div className="admin-title">
        <div>
          <p className="eyebrow">YOUR STORE, AT A GLANCE</p>
          <h1>Welcome back, {viewer?.name || "admin"}.</h1>
          <p>Latest 200 orders and products. Updates arrive in real time.</p>
        </div>
        <Button asChild>
          <Link href="/admin/products">Manage products</Link>
        </Button>
      </div>
      <div className="admin-stats">
        {[
          {
            label: "Verified revenue",
            value: money(paid.reduce((s, o) => s + o.total, 0)),
          },
          { label: "Orders", value: orders?.length ?? "…" },
          {
            label: "In transit",
            value: paid.filter((o) => o.stage !== "ready").length,
          },
          {
            label: "Active products",
            value: products?.filter((p) => p.active).length ?? "…",
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <CardDescription>{s.label}</CardDescription>
              <CardTitle className="stat-value">{s.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
          <CardDescription>
            Payment confirmation and cargo progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminTable
            caption="Recent orders"
            rows={orders.slice(0, 8)}
            rowKey={(o) => o._id}
            columns={[
              {
                id: "reference",
                label: "Reference",
                cell: (o) => <Link href="/admin/orders">{o.reference}</Link>,
              },
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
                    variant={
                      o.paymentStatus === "paid" ? "default" : "secondary"
                    }
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
            ]}
          />
        </CardContent>
        <CardFooter>
          <Button variant="outline" asChild>
            <Link href="/admin/orders">All orders</Link>
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
