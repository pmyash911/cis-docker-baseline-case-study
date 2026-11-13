import type { Metadata, Viewport } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";

import { Analytics } from "@/components/analytics";

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
  authors: [{ name: "Yalgar Consulting LLC" }],
  creator: "Yalgar Consulting LLC",
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
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Yalgar Consulting LLC — Practical security, supply chain, and operations consulting",
    description:
      "Fixed-scope reviews and plain-language deliverables for small and mid-size organizations.",
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
        <Analytics />
      </body>
    </html>
  );
}
