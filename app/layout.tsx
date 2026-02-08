import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { HeaderWrapper } from "@/components/layout/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://chirpynosh.com";

export const metadata: Metadata = {
  title: {
    default: "ChirpyNosh - Food Rescue Network",
    template: "%s | ChirpyNosh",
  },
  description:
    "Connect food suppliers with those in need. Reduce food waste, feed communities, and make a difference with ChirpyNosh — the food rescue platform.",
  keywords: [
    "food rescue",
    "food waste reduction",
    "food donation",
    "surplus food",
    "community feeding",
    "food suppliers",
    "NGO food network",
    "ChirpyNosh",
    "near expiry food",
  ],
  authors: [{ name: "ChirpyNosh Team" }],
  creator: "ChirpyNosh",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "ChirpyNosh",
    title: "ChirpyNosh - Food Rescue Network",
    description:
      "Connect food suppliers with those in need. Reduce food waste, feed communities, and make a difference.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "ChirpyNosh Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ChirpyNosh - Food Rescue Network",
    description:
      "Connect food suppliers with those in need. Reduce food waste, feed communities.",
    images: ["/logo.png"],
    creator: "@chirpynosh",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <HeaderWrapper />
        {/* Add padding-top to account for fixed header */}
        <main className="pt-16 lg:pt-18">
          {children}
        </main>
      </body>
    </html>
  );
}
