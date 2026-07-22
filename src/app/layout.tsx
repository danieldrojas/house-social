import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Nav } from "@/components/nav";
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
  title: "House Social — follow homes you love",
  description:
    "A social app for houses. Showcase your home, projects, or dream spaces — no street addresses, just town and vibes.",
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
    >
      <body className="min-h-full flex flex-col bg-[#faf7f2] text-stone-900">
        <Nav />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-stone-200/80 py-6 text-center text-xs text-stone-500">
          House Social · friends beta · no street addresses
        </footer>
      </body>
    </html>
  );
}
