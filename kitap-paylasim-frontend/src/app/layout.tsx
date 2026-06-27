import type { Metadata } from "next";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"]
})

export const metadata: Metadata = {
  title: "Kitap Paylaşım Platformu",
  description: "İkinci el kitaplarınızı paylaşın ve yenilerini keşfedin.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} bg-gray-50 min-h-screen flex flex-col`}>
        {/* Navbar'ı en tepeye koyuyoruz */}
        <Navbar />
        {/* Altındaki her şey sayfanın kendi içeriği olacak */}
        <div className="flex-grow">
          {children}
        </div>
      </body>
    </html>
  );
}
