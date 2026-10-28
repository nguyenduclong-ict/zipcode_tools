import type { Metadata, Viewport } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/lib/i18n/context";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "ZipCode Tools - Global Postal & ZIP Code 2-Way Lookup",
  description:
    "Fast, accurate 2-way postal and ZIP code lookup tool worldwide. Powered by structured international data and official national postal directories.",
  keywords: [
    "zip code",
    "postal code",
    "mã bưu chính",
    "tra cứu mã bưu chính",
    "us zip code",
    "postal code lookup",
  ],
  authors: [{ name: "ZipCode Tools" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased min-h-dvh flex flex-col">
        <LanguageProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
