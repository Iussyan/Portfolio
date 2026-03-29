import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { VersionProvider } from "@/providers/VersionProvider";
import { DispatcherLayout } from "@/components/DispatcherLayout";

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
    <html lang="en" className="dark h-full overflow-x-hidden">
      <body className={`${jakarta.variable} ${jetbrainsMono.variable} font-sans min-h-full flex flex-col antialiased`}>
        <VersionProvider>
          <DispatcherLayout>
            {children}
          </DispatcherLayout>
        </VersionProvider>
      </body>
    </html>
  );
}
