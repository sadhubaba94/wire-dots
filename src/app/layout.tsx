import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "WireDots — Modern editorial, connecting the dots",
    template: "%s · WireDots",
  },
  description:
    "WireDots is a modern article & news platform covering technology, world affairs, science and culture.",
  openGraph: {
    title: "WireDots",
    description:
      "Modern article & news platform covering technology, world affairs, science and culture.",
    type: "website",
    siteName: "WireDots",
  },
  twitter: {
    card: "summary_large_image",
    title: "WireDots",
    description:
      "Modern article & news platform covering technology, world affairs, science and culture.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
