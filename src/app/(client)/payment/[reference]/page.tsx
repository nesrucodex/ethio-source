import { PaymentResult } from "@/components/storefront/payment-result";

export const metadata = {
  title: "Payment status",
  robots: { index: false, follow: false },
};

export default async function Page({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  return <PaymentResult reference={reference} />;
}
