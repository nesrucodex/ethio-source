import { ServiceWorker } from "@/components/shared/pwa";
import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "EthioSource — Good things. Without borders.",
    template: "%s | EthioSource",
  },
  description:
    "Thoughtfully sourced from China. Brought to Ethiopia. Shop everyday favorites and pay securely in Ethiopian Birr.",
  applicationName: "EthioSource",
};
export const viewport: Viewport = { themeColor: "#264d3b" };
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Browser extensions can add body attributes before React hydrates. */}
      <body suppressHydrationWarning>
        <Providers>
          <ServiceWorker />
          {children}
        </Providers>
      </body>
    </html>
  );
}
