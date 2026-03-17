import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { CookieConsent } from "@/components/cookie-consent";
import { PostHogConsent } from "@/components/posthog-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SaaS Boilerplate",
    template: "%s | SaaS Boilerplate",
  },
  description: "A production-ready Next.js SaaS boilerplate with authentication, payments, and more.",
  keywords: ["SaaS", "Next.js", "boilerplate", "starter", "authentication"],
  authors: [{ name: "SaaS Boilerplate" }],
  creator: "SaaS Boilerplate",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    title: "SaaS Boilerplate",
    description: "A production-ready Next.js SaaS boilerplate with authentication, payments, and more.",
    siteName: "SaaS Boilerplate",
  },
  twitter: {
    card: "summary_large_image",
    title: "SaaS Boilerplate",
    description: "A production-ready Next.js SaaS boilerplate with authentication, payments, and more.",
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
        <PostHogConsent />
        {children}
        <Toaster />
        <CookieConsent />
      </body>
    </html>
  );
}
