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
  themeColor: "#f4f7fb",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-[#eef3f8] text-slate-950">
        <Providers>
          <header className="sticky top-0 z-20 px-3 py-3 sm:px-5">
            <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/70 bg-white/62 px-3 py-2 shadow-[0_18px_60px_rgba(148,163,184,0.16)] backdrop-blur-xl">
              <div className="px-2 text-[11px] font-semibold tracking-[0.24em] text-slate-500 uppercase">
                Spyfall Digital
              </div>
              <div className="flex items-center gap-1">
                <LanguageToggle />
                <AuthButton />
              </div>
            </div>
          </header>
          {children}
        </Providers>
      </body>
    </html>
  );
}
