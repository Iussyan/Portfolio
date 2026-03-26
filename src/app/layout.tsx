import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SystemPath } from "@/components/layout/SystemPath";
import { TerminalWidget } from "@/components/layout/TerminalWidget";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "OPERATOR_01 // SILVANO, JULIUS JR. K.",
  description: "Tactical Command Center - Personal Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans min-h-full flex flex-col antialiased bg-surface text-on-surface`}>
        <div className="fixed inset-0 pointer-events-none z-9999 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] blend-soft-light" />
        <Navbar />
        <main className="grow pt-14 relative z-10">
          <SystemPath />
          {children}
        </main>
        <TerminalWidget />
        <Footer />
      </body>
    </html>
  );
}
