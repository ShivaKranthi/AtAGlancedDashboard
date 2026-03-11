import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ProRx Analytics — Compounding Dashboard",
  description:
    "Upload daily At-a-Glance CSV reports and get instant analytics on inventory, production pipeline, quarantine, shipments, and demand.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} relative z-1`}>
        <TooltipProvider delayDuration={200}>
          <Navbar />
          <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
        </TooltipProvider>
      </body>
    </html>
  );
}
