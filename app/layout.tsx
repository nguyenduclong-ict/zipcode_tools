import type { Metadata, Viewport } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "ZipCode Tools - Tra Cứu Mã Bưu Chính Toàn Cầu Nhanh & Chính Xác",
  description:
    "Công cụ tra cứu mã Zip code, Postal code 2 chiều toàn cầu (Việt Nam, Hoa Kỳ, Anh, Canada, Nhật Bản...). Vận hành trên Cloudflare Edge & D1 tốc độ cao, hoàn toàn miễn phí.",
  keywords: [
    "zip code",
    "postal code",
    "mã bưu chính",
    "tra cứu mã bưu chính",
    "mã zip việt nam",
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
    <html lang="vi">
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
