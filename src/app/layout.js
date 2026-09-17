import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

import ToastContainer from "@/components/ui/ToastContainer";

export const metadata = {
  title: "Working Ledger",
  description: "A personal operating system that keeps receipts.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} ${mono.variable} font-sans bg-paper text-ink min-h-screen flex flex-col`}>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
