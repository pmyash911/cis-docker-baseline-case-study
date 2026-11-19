import type { Metadata, Viewport } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";

import { Analytics } from "@/components/analytics";

import "./tokens.css";
import "./globals.css";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-source-serif",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://yalgar.com"),
  title: {
    default:
      "Yalgar Consulting LLC — Practical security, supply chain, and operations consulting",
    template: "%s — Yalgar Consulting LLC",
  },
  description:
    "Fixed-scope reviews and plain-language deliverables designed to answer what to fix, why it matters, and who owns it. Security risk assessments, vendor and supply chain reviews, and web application reviews for small and mid-size organizations.",
  applicationName: "Yalgar Consulting LLC",
  authors: [{ name: "Yash Patel", url: "https://yalgar.com/about" }],
  creator: "Yash Patel",
  publisher: "Yalgar Consulting LLC",
  keywords: [
    "security risk assessment",
    "supply chain consulting",
    "operations consulting",
    "NIST CSF",
    "CIS benchmarks",
    "vendor risk review",
    "web application security",
  ],
  openGraph: {
    type: "website",
    siteName: "Yalgar Consulting LLC",
    title:
      "Yalgar Consulting LLC — Practical security, supply chain, and operations consulting",
    description:
      "Fixed-scope reviews and plain-language deliverables for small and mid-size organizations.",
    url: "https://yalgar.com",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Yalgar Consulting LLC — practical security, supply chain, and operations consulting",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Yalgar Consulting LLC — Practical security, supply chain, and operations consulting",
    description:
      "Fixed-scope reviews and plain-language deliverables for small and mid-size organizations.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/icon.svg",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fcf9f8",
};

// Person/Organization entities so search engines can associate the practice
// with Yash Patel and his public profiles (sameAs).
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://yalgar.com/#organization",
      name: "Yalgar Consulting LLC",
      alternateName: "Yalgar Consulting",
      url: "https://yalgar.com",
      email: "inquiry@yalgar.com",
      founder: { "@id": "https://yalgar.com/#person" },
    },
    {
      "@type": "Person",
      "@id": "https://yalgar.com/#person",
      name: "Yash Patel",
      url: "https://yalgar.com/about",
      email: "inquiry@yalgar.com",
      sameAs: [
        "https://linkedin.com/in/yash-patelycc",
        "https://github.com/pmyash911",
      ],
      worksFor: { "@id": "https://yalgar.com/#organization" },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sourceSerif.variable} ${sourceSans.variable}`}>
      <body className="flex min-h-screen flex-col bg-surface-container-lowest">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-primary-container focus:px-4 focus:py-2 focus:text-on-primary"
        >
          Skip to content
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}
