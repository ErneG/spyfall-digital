"use client";

import { HeroSection, FooterInfo, useHomeState } from "./home-parts";
import { ModeContent } from "./mode-content";

export default function Home() {
  const state = useHomeState();

  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center bg-black p-4">
      <div className="w-full max-w-md space-y-8">
        <HeroSection />
        <ModeContent {...state} />
        <FooterInfo />
      </div>
    </main>
  );
}
