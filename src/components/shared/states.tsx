import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
export { ProductCardsLoading as LoadingCards } from "./loading";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
export function EmptyState({
  title,
  description,
  href = "/products",
  action = "Explore the collection",
}: {
  title: string;
  description?: string;
  href?: string;
  action?: string;
}) {
  return (
    <Empty className="py-20">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ShoppingBag />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link href={href}>{action}</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
export function Notice({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Alert>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
