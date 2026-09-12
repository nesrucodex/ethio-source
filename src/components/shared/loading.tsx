import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Compose the shapes to match the content that will replace them.
export function LoadingRegion({
  children,
  label = "Loading content",
  className,
}: {
  children: ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <section
      className={cn("loading-region", className)}
      role="status"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
      <div aria-hidden="true">{children}</div>
    </section>
  );
}
export function LoadingHeading() {
  return (
    <div className="loading-heading">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-3/5 max-w-80" />
        <Skeleton className="h-3 w-4/5 max-w-md" />
      </div>
      <Skeleton className="h-10 w-28 shrink-0 rounded-full" />
    </div>
  );
}
export function LoadingStats() {
  return (
    <div className="admin-stats">
      {Array.from({ length: 4 }, (_, index) => (
        <div className="loading-surface" key={index}>
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="mt-5 h-8 w-1/2" />
          <Skeleton className="mt-3 h-2 w-1/3" />
        </div>
      ))}
    </div>
  );
}
export function LoadingRows() {
  return (
    <div className="loading-surface">
      <div className="flex flex-col gap-3 pb-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-3/5 max-w-72" />
      </div>
      <div className="loading-table">
        {Array.from({ length: 5 }, (_, index) => (
          <div className="loading-row" key={index}>
            <Skeleton className="size-9 shrink-0 rounded-xl" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton className={index % 2 ? "h-3 w-2/3" : "h-3 w-3/4"} />
              <Skeleton className="h-2 w-1/3" />
            </div>
            <Skeleton className="loading-row-detail h-3 w-20" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
export function DashboardSkeleton() {
  return (
    <>
      <LoadingHeading />
      <LoadingStats />
      <LoadingRows />
    </>
  );
}
export function DashboardLoading() {
  return (
    <LoadingRegion label="Loading your store overview">
      <DashboardSkeleton />
    </LoadingRegion>
  );
}
export function ListLoading({ label = "Loading records" }: { label?: string }) {
  return (
    <LoadingRegion label={label}>
      <LoadingHeading />
      <LoadingRows />
    </LoadingRegion>
  );
}
export function FormLoading({
  label = "Loading settings",
}: {
  label?: string;
}) {
  return (
    <LoadingRegion label={label}>
      <LoadingHeading />
      <div className="admin-grid">
        {[0, 1].map((index) => (
          <div className="loading-surface flex flex-col gap-6" key={index}>
            <Skeleton className="h-5 w-1/2" />
            {[0, 1, 2].map((field) => (
              <div className="flex flex-col gap-3" key={field}>
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}
export function WorkspaceLoading({
  sidebar = "expanded",
  children = <DashboardSkeleton />,
}: {
  sidebar?: "expanded" | "collapsed";
  children?: ReactNode;
}) {
  return (
    <LoadingRegion
      label="Preparing your workspace"
      className="workspace-loading"
    >
      <div className="admin-layout" data-sidebar={sidebar}>
        <aside className="admin-sidebar">
          <div className="admin-sidebar-top">
            <div className="admin-brand">
              <div className="brand">
                <span className="brand-mark">e</span>ethiosource.
              </div>
            </div>
            <Skeleton className="size-8 shrink-0 rounded-lg" />
          </div>
          <p className="admin-sidebar-label">STORE WORKSPACE</p>
          <div className="loading-nav">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="loading-nav-item">
                <Skeleton className="size-5 shrink-0 rounded-md" />
                <Skeleton className="admin-nav-label h-3 w-28" />
              </div>
            ))}
          </div>
          <Skeleton className="admin-nav-label mt-auto h-3 w-32" />
        </aside>
        <div className="admin-main">
          <div className="admin-workspace-bar">
            <span>
              Workspace <span aria-hidden="true">/</span> Getting ready
            </span>
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>
          {children}
        </div>
      </div>
    </LoadingRegion>
  );
}
export function ProductCardsLoading() {
  return (
    <LoadingRegion label="Loading products">
      <div className="product-grid">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index}>
            <Skeleton className="aspect-[4/5] rounded-2xl" />
            <Skeleton className="mt-4 h-5 w-2/3" />
            <Skeleton className="mt-2 h-4 w-1/3" />
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}
