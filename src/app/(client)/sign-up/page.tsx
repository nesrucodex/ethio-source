import { Suspense } from "react";
import { Auth } from "@/components/storefront/auth";
export default function Page() {
  return (
    <Suspense>
      <Auth signUp />
    </Suspense>
  );
}
