"use client";
import { useState } from "react";
import { useAction } from "convex/react";
import { ConvexError } from "convex/values";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { FormSection } from "@/components/shared/form-section";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";

export function AddUser({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const create = useAction(api.users.create);
  return (
    <Sheet
      open={open}
      onOpenChange={(value) => {
        if (!busy) {
          setOpen(value);
          setError("");
        }
      }}
    >
      <SheetTrigger asChild>
        <Button>
          <Plus data-icon="inline-start" aria-hidden="true" />
          Add user
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full gap-0 sm:max-w-lg">
        <SheetHeader className="shrink-0 border-b p-6 pr-14">
          <SheetTitle>Add user</SheetTitle>
          <SheetDescription>
            Create a customer account with email and password sign-in.
          </SheetDescription>
        </SheetHeader>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={async (event) => {
            event.preventDefault();
            if (busy) return;
            const form = event.currentTarget;
            const data = new FormData(form);
            setBusy(true);
            setError("");
            try {
              await create({
                name: String(data.get("name")),
                email: String(data.get("email")),
                password: String(data.get("password")),
                phone: String(data.get("phone") || "") || undefined,
              });
              form.reset();
              onCreated();
              setOpen(false);
              toast.success("User created", {
                description:
                  "The customer can now sign in with their email and password.",
              });
            } catch (err) {
              setError(
                err instanceof ConvexError && typeof err.data === "string"
                  ? err.data
                  : "Could not create the user. Please try again.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <FieldGroup className="min-h-0 flex-1 overflow-y-auto p-6">
            <FormSection>
              <Field>
                <FieldLabel htmlFor="add-user-name">Full name</FieldLabel>
                <Input
                  id="add-user-name"
                  name="name"
                  placeholder="Customer name"
                  autoComplete="off"
                  required
                  minLength={2}
                  maxLength={100}
                  disabled={busy}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="add-user-email">Email</FieldLabel>
                <Input
                  id="add-user-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="off"
                  required
                  maxLength={254}
                  disabled={busy}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="add-user-phone">
                  Phone (optional)
                </FieldLabel>
                <Input
                  id="add-user-phone"
                  name="phone"
                  type="tel"
                  placeholder="0911234567"
                  autoComplete="off"
                  pattern="(\+?251[79][0-9]{8}|0[79][0-9]{8})"
                  disabled={busy}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="add-user-password">Password</FieldLabel>
                <Input
                  id="add-user-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="10+ characters"
                  required
                  minLength={10}
                  maxLength={128}
                  disabled={busy}
                  aria-describedby="add-user-password-help"
                />
              </Field>
            </FormSection>
            <p
              id="add-user-password-help"
              className="text-xs leading-6 text-muted-foreground"
            >
              Use 10–128 characters. Share the sign-in details privately with
              the customer. This form does not send an email or mark contact
              details as verified.
            </p>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </FieldGroup>
          <SheetFooter className="shrink-0 border-t p-6">
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy && (
                  <Loader2
                    className="animate-spin"
                    aria-hidden="true"
                    data-icon="inline-start"
                  />
                )}
                {busy ? "Creating…" : "Create user"}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
