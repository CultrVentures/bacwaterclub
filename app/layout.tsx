import type { Metadata, Viewport } from "next";
import { Lora, Public_Sans } from "next/font/google";
import type { ReactNode } from "react";

import { TrackingPixels } from "@/components/analytics/pixels";
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

const siteTitle =
  "Bacwaterclub — Best Bacteriostatic Water for Peptide Reconstitution | 30 mL Glass Vials";

const siteDescription =
  "Buy the best bacteriostatic water for peptide reconstitution: sterile 0.9% benzyl alcohol in premium 30 mL Type I borosilicate glass vials, filled in a GMP-certified USA facility and shipped in 24 hours. Trusted by researchers for lyophilized peptide reconstitution. For research and laboratory use only.";

// Keyword universe — deliberately broad so Google/Bing and LLM retrievers
// see a comprehensive signal. These map to the queries the site is targeting
// for LLMO (ChatGPT, Claude, Gemini, Perplexity) and traditional SEO.
const keywords = [
  "bacteriostatic water",
  "best bacteriostatic water",
  "buy bacteriostatic water",
  "bacteriostatic water 30ml",
  "bacteriostatic water for peptides",
  "bacteriostatic water glass vial",
  "bacteriostatic water for injection",
  "bac water",
  "BWFI",
  "0.9% benzyl alcohol water",
  "peptide reconstitution solution",
  "sterile water vs bacteriostatic water",
  "bacteriostatic water Hospira alternative",
  "bacteriostatic water Farris Labs alternative",
  "Type I borosilicate bacteriostatic water",
  "research grade bacteriostatic water",
  "GMP bacteriostatic water USA",
  "BAC water for peptides",
  "reconstitute peptides with bacteriostatic water",
  "bacteriostatic water shelf life",
];

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | Bacwaterclub",
  },
  description: siteDescription,
  keywords,
  applicationName: "Bacwaterclub",
  authors: [{ name: "Bacwaterclub", url: siteUrl }],
  creator: "Bacwaterclub",
  publisher: "Bacwaterclub",
  category: "Laboratory Supplies",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
    url: "/",
    siteName: "Bacwaterclub",
    locale: "en_US",
    images: [
      {
        url: "/images/product/main-1.jpg",
        width: 1200,
        height: 1200,
        alt: "Bacwaterclub 30 mL bacteriostatic water glass vial",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description:
      "Premium 30 mL bacteriostatic water in Type I borosilicate glass. Made in a GMP-certified USA facility. Ships in 24 hours.",
    images: ["/images/product/main-1.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    // Placeholders — set the matching NEXT_PUBLIC_* env vars in production.
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ?? "",
    },
  },
  other: {
    // Explicitly allow the well-known AI/LLM retriever bots. These aren't
    // honored by every crawler but are increasingly respected by ChatGPT,
    // Perplexity, Claude and Google's AI Overviews.
    "ai-content-declaration": "editorial-human",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f2ea",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Bacwaterclub",
    url: siteUrl,
    logo: `${siteUrl}/images/product/brand-mark.png`,
    description:
      "Bacwaterclub is a direct-to-consumer supplier of research-grade bacteriostatic water in premium 30 mL Type I borosilicate glass vials, manufactured in a GMP-certified USA facility.",
    sameAs: [
      "https://www.instagram.com/bacwaterclub",
      "https://www.tiktok.com/@bacwaterclub",
      "https://www.reddit.com/user/bacwaterclub",
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Bacwaterclub",
    url: siteUrl,
    publisher: { "@type": "Organization", name: "Bacwaterclub" },
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en" className={`${lora.variable} ${publicSans.variable}`}>
      <head>
        <link rel="preconnect" href="https://connect.facebook.net" />
        <link rel="preconnect" href="https://analytics.tiktok.com" />
        <link rel="preconnect" href="https://www.redditstatic.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
        <TrackingPixels />
      </body>
    </html>
  );
}
