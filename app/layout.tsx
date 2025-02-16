import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";
import { Header } from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gator Marketplace",
  description: "A marketplace for University of Florida students",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Ensure the body has a white background */}
      <body className={`${inter.className} bg-white`}>
        <Header />
        {/* Remove bg-gray-100 from <main> */}
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
          {children}
        </main>
      </body>
    </html>
  );
}
