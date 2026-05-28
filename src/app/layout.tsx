import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TapCash | Earn Real Cash Completing Tasks",
  description: "Complete surveys, try apps, watch videos. Get paid instantly with PayPal. Join 50,000+ earners.",
  keywords: "earn money online, get paid surveys, reward apps, cashback, TapCash",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-[#060606] text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
