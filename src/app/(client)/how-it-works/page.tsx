import Link from "next/link";
import { Button } from "@/components/ui/button";
export const metadata = { title: "How it works" };
export default function Page() {
  return (
    <article className="prose-page">
      <p className="eyebrow">FROM CHINA TO ETHIOPIA</p>
      <h1>A shorter path to your next good find.</h1>
      <h2>01. Find something you love.</h2>
      <p>
        Explore our collection in English, Amharic, or Afaan Oromoo. Product
        prices are displayed in Ethiopian Birr using the store’s current
        exchange rates and margin.
      </p>
      <h2>02. Pay in Birr.</h2>
      <p>
        Create an account, review your bag, and enter your delivery details. We
        check prices and stock again before reserving your items for 30 minutes.
        Chapa handles your payment securely using the methods available to your
        account.
      </p>
      <h2>03. Follow the journey.</h2>
      <p>
        Once Chapa verifies your payment, your order is confirmed. Your order
        page updates as it ships from China, reaches customs at Modjo, and
        becomes ready for pickup. Arrival timing depends on supplier dispatch
        and customs clearance.
      </p>
      <h2>04. A little closer to home.</h2>
      <p>
        Pickup instructions appear in your order’s tracking notes. Keep your
        order reference and contact details handy when collecting your parcel.
      </p>
      <Button asChild>
        <Link href="/products">Explore the collection</Link>
      </Button>
    </article>
  );
}
