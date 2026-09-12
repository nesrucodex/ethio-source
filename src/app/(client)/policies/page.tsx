export const metadata = { title: "Delivery, returns & privacy" };
export default function Page() {
  return (
    <article className="prose-page">
      <p className="eyebrow">CLARITY AT EVERY STEP</p>
      <h1>Delivery, returns & privacy.</h1>
      <h2>Store launch status</h2>
      <p>
        This development storefront contains sample products and sample exchange
        rates. Live sales require merchant setup, verified supplier agreements,
        and published commercial terms. No delivery guarantee or supplier
        certification is implied by sample listings.
      </p>
      <h2>Delivery pricing</h2>
      <p>
        The current checkout rule is 450 Br per order, with free delivery from
        15,000 Br. This is a configurable launch assumption and must be approved
        before accepting live orders. Confirm any customs, duties, pickup
        charges, and delivery coverage in the published commercial terms before
        launch.
      </p>
      <h2>Order confirmation</h2>
      <p>
        An order is confirmed only after payment verification. Returning from
        the payment page does not prove payment. Payments made after a stock
        reservation expires may require manual review.
      </p>
      <h2>Returns and refunds</h2>
      <p>
        The store operator must publish return windows, eligible products,
        refund timelines, and a support contact before live sales begin. Refunds
        are currently handled through the merchant’s payment dashboard; this app
        does not issue automatic refunds.
      </p>
      <h2>Your information</h2>
      <p>
        Your account, email, phone number, delivery address, and order history
        are stored in Convex to operate your account and fulfill orders. Chapa
        receives the details needed to process payments. Payment card details
        are not stored in this application.
      </p>
      <p>
        Your browser stores your selected language and shopping bag.
        Authentication uses the Convex Auth session mechanism. The operator must
        configure data retention, support and deletion procedures, and
        applicable privacy terms before launch.
      </p>
    </article>
  );
}
