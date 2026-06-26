import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("http://localhost:3000"),
  title: "JsonView - The Best JSON Viewer, Formatter & Analyzer",
  description:
    "The fastest way to inspect JSON. Format, validate, search, convert, and visualize JSON with a beautiful, blazing-fast developer tool. Everything stays in your browser.",
  keywords: ["json", "formatter", "viewer", "validator", "analyzer", "debugger", "developer tools"],
  authors: [{ name: "JsonView" }],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "JsonView - The Best JSON Viewer, Formatter & Analyzer",
    description: "The fastest way to inspect JSON. Privacy-first. Works offline.",
    type: "website",
    images: ["/logo.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
