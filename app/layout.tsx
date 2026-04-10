import type { Metadata } from "next";
import { Lora, Public_Sans } from "next/font/google";
import type { ReactNode } from "react";

import { RedditPixel } from "@/components/landing/reddit-pixel";

import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lora",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-public-sans",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Hospira Bacteriostatic Water for Injection | Clinician Pricing Requests",
    template: "%s | CULTR Health",
  },
  description:
    "A professional pathway for licensed clinicians and authorized healthcare purchasers seeking pricing, availability, documentation, and account setup for Hospira Bacteriostatic Water for Injection.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Hospira Bacteriostatic Water for Injection for Clinical Buyers",
    description:
      "Professional procurement, verification, and pricing request flow for qualified healthcare purchasers in the United States.",
    type: "website",
    url: "/",
    siteName: "CULTR Health",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${lora.variable} ${publicSans.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <RedditPixel />
        {children}
      </body>
    </html>
  );
}
