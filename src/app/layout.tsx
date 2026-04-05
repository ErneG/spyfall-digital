import { Geist, Geist_Mono } from "next/font/google";

import { LanguageToggle } from "@/components/language-toggle";
import { Providers } from "@/components/providers";
import { AuthButton } from "@/domains/auth/components/auth-button";

import type { Metadata, Viewport } from "next";
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
  title: "Spyfall Digital",
  description:
    "A digital social deduction game — find the spy before they figure out the location!",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Spyfall",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-black">
        <Providers>
          <header className="flex items-center justify-end gap-1 p-2">
            <LanguageToggle />
            <AuthButton />
          </header>
          {children}
        </Providers>
      </body>
    </html>
  );
}
