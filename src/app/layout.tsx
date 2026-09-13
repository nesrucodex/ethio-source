import { ServiceWorker } from "@/components/shared/pwa";
import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import { env } from "@/config/env";
import "./globals.css";
const title = "EthioSource — Good things. Without borders.";
const description =
  "Thoughtfully sourced from China. Brought to Ethiopia. Shop everyday favorites and pay securely in Ethiopian Birr.";
const socialImage = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "EthioSource — Good things. Without borders. Thoughtfully sourced from China. Brought to Ethiopia.",
};
export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: title,
    template: "%s | EthioSource",
  },
  description,
  applicationName: "EthioSource",
  openGraph: {
    type: "website",
    url: "./",
    siteName: "EthioSource",
    locale: "en_US",
    title,
    description,
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [socialImage],
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml", sizes: "any" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
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
