import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import SiteLayout from "@/components/SiteLayout";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  referrer: "no-referrer",
  title: "Desi Hot Pic — Trending Adult Photos & Streaming Videos",
  description:
    "Discover trending albums, high-definition photo galleries, and streaming videos on Desi Hot Pic. 18+ only.",
  keywords: [
    "Desi Hot Pic",
    "desi photos",
    "adult discovery",
    "babe galleries",
    "trending clips",
    "desi streaming",
  ],
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-[#f5f5f5] font-body">
        <SiteLayout>{children}</SiteLayout>
      </body>
    </html>
  );
}
