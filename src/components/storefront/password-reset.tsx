"use client";
import { FormSection } from "@/components/shared/form-section";
import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useCatalog } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { Notice } from "@/components/shared/states";
export function PasswordReset() {
  const { connected } = useCatalog();
  return (
    <div className="auth-shell">
      <h1>A fresh start.</h1>
      <p>Reset your password with a code sent to your email.</p>
      {connected ? (
        <ResetForm />
      ) : (
        <Notice title="Account setup is pending">
          Password reset is unavailable in preview mode.
        </Notice>
      )}
    </div>
  );
}
function ResetForm() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const data = new FormData(e.currentTarget);
        data.set("flow", sent ? "reset-verification" : "reset");
        data.set("email", email);
        try {
          await signIn("password", data);
          if (sent) router.push("/account");
          else setSent(true);
        } catch {
          if (!sent) setSent(true);
          else
            setError(
              "The code is invalid or expired. Request another code and try again.",
            );
        } finally {
          setBusy(false);
        }
      }}
    >
      <FieldGroup>
        <FormSection>
          <Field>
            <FieldLabel htmlFor="reset-email">Email address</FieldLabel>
            <Input
              id="reset-email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              autoComplete="email"
              disabled={sent}
            />
          </Field>
        </FormSection>
        {sent ? (
          <>
            <Notice title="Check your email">
              If this account exists and email delivery is configured, you will
              receive a reset code.
            </Notice>
            <FormSection>
              <Field>
                <FieldLabel htmlFor="reset-code">Reset code</FieldLabel>
                <Input
                  id="reset-code"
                  name="code"
                  placeholder="Email code"
                  required
                  autoComplete="one-time-code"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="new-password">New password</FieldLabel>
                <Input
                  id="new-password"
                  name="newPassword"
                  placeholder="New password"
                  type="password"
                  minLength={10}
                  autoComplete="new-password"
                  required
                />
              </Field>
            </FormSection>
          </>
        ) : null}
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <Button disabled={busy} type="submit">
          {busy
            ? "Please wait…"
            : sent
              ? "Set new password"
              : "Send reset code"}
        </Button>
        {sent ? (
          <Button variant="ghost" type="button" onClick={() => setSent(false)}>
            Request another code
          </Button>
        ) : null}
      </FieldGroup>
    </form>
  );
}
