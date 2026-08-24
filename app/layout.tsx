import "./globals.css";
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
import VoterSync from "@/components/VoterSync";
import { Inter, Manrope } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-headline" });

export const metadata = {
  title: "Jan Seva — Civic Issue Reporting Platform",
  description: "Community-driven civic issue reporting platform connecting citizens with municipal authorities.",
};

import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable, manrope.variable)}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,200,0,0"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-on-surface">
        <Script
          src={`https://apis.mappls.com/advancedmaps/api/${process.env.NEXT_PUBLIC_MAPPLS_SDK_KEY}/map_sdk?v=3.0&layer=vector`}
          strategy="beforeInteractive"
        />
        
        <div className="relative z-0 flex flex-col min-h-screen">
          <AuthProvider>
            <VoterSync />
            <Header />
            <main className="w-full flex-1">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
