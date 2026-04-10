import type { Metadata } from "next";
import { Lora, Public_Sans } from "next/font/google";
import type { ReactNode } from "react";

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bacwaterclub.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Bacwaterclub — Bacteriostatic Water in 30 mL Glass Vials",
    template: "%s | Bacwaterclub",
  },
  description:
    "Premium bacteriostatic water for peptide reconstitution. 0.9% benzyl alcohol in sealed Type I borosilicate glass vials, made in a GMP-certified USA facility. For research and laboratory use only.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Bacwaterclub — Bacteriostatic Water in 30 mL Glass Vials",
    description:
      "Sterile 0.9% benzyl alcohol bacteriostatic water in premium 30 mL borosilicate glass vials. Ships in 24 hours from the USA.",
    type: "website",
    url: "/",
    siteName: "Bacwaterclub",
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
        {children}
      </body>
    </html>
  );
}
