import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";
import { Header } from "@/components/Header";
import Script from "next/script"; //  Import the Script component

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
      <head>
        {/*  Include the TalkJS script */}
        <Script
          strategy="beforeInteractive"
          src="https://cdn.talkjs.com/talk.js"
        />
      </head>
      <body className={`${inter.className} bg-white`}>
        <Header />
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
          {children}
        </main>
      </body>
    </html>
  );
}
