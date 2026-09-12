"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="shell page-content">
      <h1 className="mb-5 text-3xl">Something interrupted the journey.</h1>
      <p className="mb-6 text-muted-foreground">
        Please try again. Your saved bag is still here.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
