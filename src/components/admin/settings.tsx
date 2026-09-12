"use client";
import { AdminTable, adminDateTime } from "./admin-table";
import { FormSection } from "@/components/shared/form-section";
import { FormLoading } from "@/components/shared/loading";
import { useState } from "react";
import { usePaginatedQuery, useMutation, useAction } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { useCatalog } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
export function Settings() {
  const { rates } = useCatalog();
  const {
    results: logs,
    status,
    loadMore,
  } = usePaginatedQuery(api.integrations.logPage, {}, { initialNumItems: 20 });
  const save = useMutation(api.catalog.setRates);
  const run = useAction(api.integrations.run);
  const [busy, setBusy] = useState(false);
  async function sync(kind: "supplier" | "rates") {
    setBusy(true);
    try {
      await run({ kind });
      toast.info("Sync finished. See the activity log for the result.");
    } catch {
      toast.error("Sync could not run");
    } finally {
      setBusy(false);
    }
  }
  if (rates === undefined || status === "LoadingFirstPage")
    return <FormLoading />;
  return (
    <>
      <div className="admin-title">
        <div>
          <h1>Rates & integrations</h1>
          <p>One pricing engine. Every product updates in real time.</p>
        </div>
      </div>
      <div className="admin-grid">
        <Card>
          <CardHeader>
            <CardTitle>Currency exchange</CardTitle>
            <CardDescription>
              ETB per unit of source currency, plus your store margin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {rates ? (
              <form
                id="rates"
                key={`${rates.usd}-${rates.cny}-${rates.markup}`}
                onSubmit={async (e) => {
                  e.preventDefault();
                  const d = new FormData(e.currentTarget);
                  setBusy(true);
                  try {
                    await save({
                      usd: Number(d.get("usd")),
                      cny: Number(d.get("cny")),
                      markup: Number(d.get("markup")),
                    });
                    toast.success("Prices updated across the store");
                  } catch {
                    toast.error("Check the rates and try again");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <FieldGroup>
                  <FormSection>
                    {[
                      { name: "usd", label: "1 USD in ETB", value: rates.usd },
                      { name: "cny", label: "1 CNY in ETB", value: rates.cny },
                      {
                        name: "markup",
                        label: "Store margin (%)",
                        value: rates.markup,
                      },
                    ].map((f) => (
                      <Field key={f.name}>
                        <FieldLabel htmlFor={f.name}>{f.label}</FieldLabel>
                        <Input
                          id={f.name}
                          name={f.name}
                          type="number"
                          min={f.name === "markup" ? 0 : 0.01}
                          max={f.name === "markup" ? 200 : undefined}
                          step="0.01"
                          required
                          defaultValue={f.value}
                        />
                      </Field>
                    ))}
                  </FormSection>
                  <p className="text-xs text-muted-foreground">
                    Source: {rates.source}. Existing order totals are preserved.
                  </p>
                </FieldGroup>
              </form>
            ) : (
              <p>Configure initial rates through the seed command.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button form="rates" type="submit" disabled={busy}>
              Save exchange rates
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Supplier & exchange feeds</CardTitle>
            <CardDescription>
              Scheduled daily. Manual sync is available when a feed is
              configured.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-7 text-muted-foreground">
              The supplier connection is awaiting your provider choice. Feed
              errors preserve the existing catalog. Review every sync result
              below.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Supplier: 02:00 UTC daily · Exchange: 01:00 UTC daily
            </p>
          </CardContent>
          <CardFooter className="flex-wrap gap-3">
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void sync("supplier")}
            >
              Sync supplier
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void sync("rates")}
            >
              Sync rates
            </Button>
          </CardFooter>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Integration activity</CardTitle>
          <CardDescription>
            Newest runs first. Browse older activity below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminTable
            caption="Integration activity"
            rows={logs}
            rowKey={(l) => l._id}
            loadMore={status === "CanLoadMore" ? () => loadMore(20) : undefined}
            loadingMore={status === "LoadingMore"}
            columns={[
              {
                id: "date",
                label: "Date",
                cell: (l) => adminDateTime.format(l.at),
              },
              { id: "kind", label: "Feed", cell: (l) => l.kind },
              {
                id: "status",
                label: "Status",
                cell: (l) => <Badge variant="secondary">{l.status}</Badge>,
              },
              { id: "message", label: "Details", cell: (l) => l.message },
            ]}
          />
        </CardContent>
      </Card>
    </>
  );
}
