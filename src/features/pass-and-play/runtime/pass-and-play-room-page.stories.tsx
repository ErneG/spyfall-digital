import { Sparkles } from "lucide-react";
import Link from "next/link";
import { fn } from "storybook/test";

import { RevealScreen } from "@/entities/game/pass-and-play";

import { PlayingPhase } from "./pass-and-play-playing";

import type { GameView } from "@/entities/game/schema";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Pass & Play/Runtime",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const players = [
  { id: "player-1", name: "Avery" },
  { id: "player-2", name: "Jordan" },
  { id: "player-3", name: "Casey" },
  { id: "player-4", name: "Morgan" },
];

const game = {
  gameId: "game-1",
  phase: "PLAYING",
  myRole: "Detective",
  isSpy: false,
  location: "Embassy",
  allLocations: [
    { id: "location-1", name: "Embassy", imageUrl: null },
    { id: "location-2", name: "Harbor", imageUrl: null },
    { id: "location-3", name: "Night Train", imageUrl: null },
    { id: "location-4", name: "Safe House", imageUrl: null },
  ],
  players: players.map((player, index) => ({
    ...player,
    isHost: index === 0,
    isOnline: true,
  })),
  timeRemaining: 412,
  timeLimit: 480,
  startedAt: "2026-04-11T10:00:00.000Z",
  timerRunning: true,
  hideSpyCount: false,
  spyCount: 1,
  prevLocationName: "Night Train",
} satisfies GameView;

const translations = {
  game: {
    endGame: "End game",
    ending: "Ending…",
  },
  passAndPlay: {
    peekAtRole: "Peek at role again",
  },
  players: {
    title: "Players",
  },
} as const;

function RuntimeReviewSurface({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#eef3f8] text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.96),rgba(255,255,255,0.58)_32%,transparent_54%),radial-gradient(circle_at_82%_18%,rgba(191,219,254,0.52),transparent_28%),radial-gradient(circle_at_78%_78%,rgba(207,250,254,0.4),transparent_22%),linear-gradient(180deg,#f8fbff_0%,#edf2f7_52%,#e8eef4_100%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="rounded-[34px] border border-white/80 bg-white/66 p-6 shadow-[0_35px_100px_rgba(148,163,184,0.2)] backdrop-blur-2xl">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-1.5 transition hover:bg-white"
            >
              <Sparkles className="size-3.5" />
              Home
            </Link>
            <Link
              href="/play/pass-and-play"
              className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-1.5 transition hover:bg-white"
            >
              Pass &amp; Play
            </Link>
          </div>
          <div className="mt-5 space-y-2">
            <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
              Runtime review surface
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">{description}</p>
          </div>
        </header>

        <section className="rounded-[34px] border border-white/80 bg-white/32 p-2 shadow-[0_35px_100px_rgba(148,163,184,0.16)] backdrop-blur-xl">
          {children}
        </section>
      </div>
    </div>
  );
}

export const ActiveRound: Story = {
  render: () => (
    <RuntimeReviewSurface
      title="Active round"
      description="Review the live pass-and-play screen with the timer, player list, location reference grid, and privacy-safe sticky actions all visible together."
    >
      <PlayingPhase
        state={
          {
            activeGameId: "game-1",
            display: "6:52",
            endMutation: { isPending: false },
            game,
            handleLeave: fn(),
            isExpired: false,
            isTimerRunning: true,
            onEndGameClick: fn(),
            onTimerToggle: fn(),
            roundNumber: 2,
          } as never
        }
        allPlayers={players}
        shouldHideSpyCount={false}
        spyCount={1}
        t={translations as never}
      />
    </RuntimeReviewSurface>
  ),
};

export const RoundReveal: Story = {
  render: () => (
    <RuntimeReviewSurface
      title="Reveal and replay"
      description="Review the end-of-round handoff with the revealed location, spy roster, and replay controls in the calmer light-first runtime shell."
    >
      <RevealScreen
        game={{
          ...game,
          phase: "REVEAL",
          votes: [{ voterId: "player-1", suspectId: "player-3" }],
          spies: ["player-3"],
          revealedLocation: "Embassy",
        }}
        playerId="player-1"
        isHost
        passAndPlay
        isRestarting={false}
        onRestart={fn()}
        onLeave={fn()}
      />
    </RuntimeReviewSurface>
  ),
};
