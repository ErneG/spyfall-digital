"use client";

import { FooterInfo, HeroSection, useHomeState } from "./home-parts";
import { ModeContent } from "./mode-content";

export function HomePageClient() {
  const state = useHomeState();

  return (
    <main className="relative min-h-[calc(100dvh-5rem)] overflow-hidden px-4 pb-10 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),rgba(255,255,255,0.6)_28%,transparent_54%),radial-gradient(circle_at_85%_12%,rgba(191,219,254,0.6),transparent_26%),radial-gradient(circle_at_75%_75%,rgba(207,250,254,0.5),transparent_24%),linear-gradient(180deg,#f8fbff_0%,#edf2f7_52%,#e8eef4_100%)]" />
      <div className="relative mx-auto flex min-h-[calc(100dvh-5rem)] max-w-7xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,520px)] lg:items-center">
          <section className="space-y-8">
            <HeroSection />
            <div className="grid gap-4 sm:grid-cols-3">
              <article className="rounded-[28px] border border-white/70 bg-white/55 p-5 shadow-[0_18px_50px_rgba(148,163,184,0.18)] backdrop-blur-xl">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase">
                  Pass &amp; Play
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  Private setup, full location preview, and clean handoff moments on one device.
                </p>
              </article>
              <article className="rounded-[28px] border border-white/70 bg-white/55 p-5 shadow-[0_18px_50px_rgba(148,163,184,0.18)] backdrop-blur-xl">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase">
                  Library
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  Inspect built-ins, save custom locations, and curate collections before game
                  night.
                </p>
              </article>
              <article className="rounded-[28px] border border-white/70 bg-white/55 p-5 shadow-[0_18px_50px_rgba(148,163,184,0.18)] backdrop-blur-xl">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase">
                  Online Rooms
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  Faster lobby setup now, with deeper room cleanup continuing behind the scenes.
                </p>
              </article>
            </div>
          </section>

          <section className="rounded-[36px] border border-white/75 bg-white/62 p-5 shadow-[0_40px_120px_rgba(148,163,184,0.22)] backdrop-blur-2xl sm:p-7">
            <ModeContent {...state} />
            <div className="mt-6">
              <FooterInfo />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
