import { Suspense } from "react";
import { Catalog } from "@/components/storefront/catalog";
import { LoadingHeading } from "@/components/shared/loading";
import { LoadingCards } from "@/components/shared/states";
export const metadata = { title: "The collection" };
export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="shell page-content">
          <LoadingHeading />
          <LoadingCards />
        </div>
      }
    >
      <Catalog />
    </Suspense>
  );
}
