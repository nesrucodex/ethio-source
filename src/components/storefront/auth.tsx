"use client";
import { FormSection } from "@/components/shared/form-section";
import { FormLoading } from "@/components/shared/loading";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useCatalog } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { EmptyState, Notice } from "@/components/shared/states";
import { Loader2, ArrowRight } from "lucide-react";
export function Auth({ signUp = false }: { signUp?: boolean }) {
  const { connected, viewer } = useCatalog();
  if (!connected)
    return (
      <div className="auth-shell">
        <Notice title="Account setup is pending">
          Connect the store backend to enable secure accounts.
        </Notice>
      </div>
    );
  if (viewer)
    return (
      <EmptyState
        title={`Welcome, ${viewer.name || "friend"}.`}
        href="/account"
        action="Go to your account"
      />
    );
  return <AuthForm signUp={signUp} />;
}
function AuthForm({ signUp }: { signUp: boolean }) {
  const { signIn } = useAuthActions();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const destination =
    next?.startsWith("/") && !next.startsWith("//") ? next : "/account";
  return (
    <div className="auth-shell">
      <p className="eyebrow">YOUR WORLD, A LITTLE CLOSER</p>
      <h1>{signUp ? "Make yourself at home." : "Good to see you again."}</h1>
      <p>
        {signUp
          ? "Create an account to save your journey from first find to final delivery."
          : "Sign in for your orders, delivery updates, and next good find."}
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          const data = new FormData(e.currentTarget);
          data.set("flow", signUp ? "signUp" : "signIn");
          try {
            await signIn("password", data);
            router.push(destination);
          } catch {
            setError(
              signUp
                ? "We couldn’t create this account. Check your details or try signing in."
                : "We couldn’t sign you in. Check your email and password, or create an account if you haven’t registered yet.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <FieldGroup>
          <FormSection>
            {signUp ? (
              <Field>
                <FieldLabel htmlFor="name">Full name</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  placeholder="Your name"
                  required
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                />
              </Field>
            ) : null}
            <Field>
              <FieldLabel htmlFor="email">Email address</FieldLabel>
              <Input
                id="email"
                name="email"
                placeholder="you@example.com"
                type="email"
                autoComplete="email"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                placeholder="Enter password"
                type="password"
                minLength={10}
                required
                autoComplete={signUp ? "new-password" : "current-password"}
              />
              {signUp ? (
                <p className="text-xs text-muted-foreground">
                  Use at least 10 characters.
                </p>
              ) : null}
            </Field>
          </FormSection>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button type="submit" size="lg" disabled={busy}>
            {busy ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <ArrowRight data-icon="inline-end" />
            )}
            {signUp ? "Create your account" : "Sign in"}
          </Button>
        </FieldGroup>
      </form>
      {!signUp ? (
        <p className="mb-5 text-center text-sm">
          <Link
            href="/reset-password"
            className="text-primary underline underline-offset-4"
          >
            Forgot your password?
          </Link>
        </p>
      ) : null}
      <p className="text-center text-sm">
        {signUp ? "Already part of the journey?" : "New to EthioSource?"}{" "}
        <Link
          className="text-primary underline underline-offset-4"
          href={`${signUp ? "/sign-in" : "/sign-up"}?next=${encodeURIComponent(destination)}`}
        >
          {signUp ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}
export function Account() {
  const { connected, viewer } = useCatalog();
  if (!connected || viewer === null)
    return (
      <EmptyState
        title="Your account awaits"
        href="/sign-in"
        action="Sign in"
      />
    );
  if (!viewer)
    return (
      <div className="shell page-content">
        <FormLoading label="Loading your account" />
      </div>
    );
  return <AccountDetails />;
}
function AccountDetails() {
  const { viewer } = useCatalog();
  const { signOut } = useAuthActions();
  return (
    <div className="shell page-content">
      <div className="page-heading">
        <p className="eyebrow">YOUR ETHIOSOURCE</p>
        <h1>Hello, {viewer?.name || "friend"}.</h1>
        <p>{viewer?.email}</p>
      </div>
      <div className="flex flex-wrap gap-4">
        <Button asChild>
          <Link href="/orders">
            Your orders <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/products">Explore the collection</Link>
        </Button>
        {viewer?.isAdmin ? (
          <Button variant="outline" asChild>
            <Link href="/admin">Open admin dashboard</Link>
          </Button>
        ) : null}
        <Button variant="ghost" onClick={() => void signOut()}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
