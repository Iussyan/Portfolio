import type { Metadata, Viewport } from "next";
import { 
  Plus_Jakarta_Sans,
  JetBrains_Mono
} from "next/font/google";

import "./globals.css";
import { Navbar } from "@v2/components/layout/Navbar";
import { Footer } from "@v2/components/layout/Footer";
import { SystemPath } from "@v2/components/layout/SystemPath";
import { TerminalWidget } from "@v2/components/layout/TerminalWidget";
import { ThemeProvider } from "@v2/components/providers/ThemeProvider";
import { AchievementProvider } from "@v2/components/providers/AchievementProvider";
import { ThemeTransition } from "@v2/components/ui/ThemeTransition";

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"]
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-mono" 
});

export const metadata: Metadata = {
  title: "Julius Silvano — Software Engineer",
  description: "Full-Stack Developer · Next.js · Flutter · Java · Building scalable digital solutions.",
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
      <body className={`
        ${jakarta.variable} 
        ${jetbrainsMono.variable} 
        font-sans min-h-full flex flex-col antialiased bg-void text-on-surface transition-colors duration-500
      `}>
        <ThemeProvider>
          <AchievementProvider>
            <ThemeTransition />
            <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.025] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none z-0 bg-primary/5 blur-[120px] rounded-full ambient-glow" />
            <Navbar />
            <main className="grow pt-16 relative z-10">
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
