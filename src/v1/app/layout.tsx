import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@v1/components/layout/Navbar";
import { Footer } from "@v1/components/layout/Footer";
import { SystemPath } from "@v1/components/layout/SystemPath";
import { TerminalWidget } from "@v1/components/layout/TerminalWidget";
import { ThemeProvider } from "@v1/components/providers/ThemeProvider";
import { AchievementProvider } from "@v1/components/providers/AchievementProvider";
import { ThemeTransition } from "@v1/components/ui/ThemeTransition";

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans min-h-full flex flex-col antialiased bg-surface text-on-surface transition-colors duration-500`}>
        <ThemeProvider>
          <AchievementProvider>
            <ThemeTransition />
            <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] blend-soft-light" />
            <Navbar />
            <main className="grow pt-14 relative">
              <SystemPath />
              {children}
            </main>
            <TerminalWidget />
            <Footer />
          </AchievementProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
