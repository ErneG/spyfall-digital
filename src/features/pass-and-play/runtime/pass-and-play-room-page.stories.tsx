import { BookOpen, Eye, Sparkles } from "lucide-react";
import Link from "next/link";
import { fn } from "storybook/test";

import { RevealScreen } from "@/entities/game/pass-and-play";

import { PlayingPhase } from "./pass-and-play-playing";

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

const translations = {
  game: {
    endGame: "End game",
    ending: "Ending...",
  },
  passAndPlay: {
    peekAtRole: "Peek at role",
  },
  players: {
    title: "Players",
  },
} as const;

const players = [
  { id: "player-1", name: "Avery" },
  { id: "player-2", name: "Jordan" },
  { id: "player-3", name: "Casey" },
  { id: "player-4", name: "Morgan" },
];

const activeRoundState = {
  activeGameId: "game-1",
  display: "6:42",
  endMutation: { isPending: false },
  game: {
    allLocations: [
      { id: "location-1", name: "Embassy", imageUrl: null },
      { id: "location-2", name: "Theater", imageUrl: null },
      { id: "location-3", name: "Submarine", imageUrl: null },
      { id: "location-4", name: "Casino", imageUrl: null },
      { id: "location-5", name: "Train", imageUrl: null },
      { id: "location-6", name: "Cathedral", imageUrl: null },
    ],
    prevLocationName: "Casino",
  },
  isExpired: false,
  isTimerRunning: true,
  onEndGameClick: fn(),
  onTimerToggle: fn(),
  roundNumber: 2,
} as const;

const revealGame = {
  gameId: "game-1",
  phase: "REVEAL",
  myRole: "Ambassador",
  isSpy: false,
  location: "Embassy",
  allLocations: [],
  players: [
    { id: "player-1", name: "Avery", isHost: true, isOnline: true },
    { id: "player-2", name: "Jordan", isHost: false, isOnline: true },
    { id: "player-3", name: "Casey", isHost: false, isOnline: true },
    { id: "player-4", name: "Morgan", isHost: false, isOnline: true },
  ],
  timeRemaining: 0,
  timeLimit: 480,
  startedAt: "2026-04-11T10:00:00.000Z",
  timerRunning: false,
  hideSpyCount: false,
  spyCount: 1,
  prevLocationName: "Casino",
  votes: [
    { voterId: "player-1", suspectId: "player-2" },
    { voterId: "player-3", suspectId: "player-2" },
  ],
  spies: ["player-2"],
  revealedLocation: "Embassy",
} as const;

function RuntimeFrame({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eef3f8] text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),rgba(255,255,255,0.58)_30%,transparent_54%),radial-gradient(circle_at_85%_18%,rgba(191,219,254,0.55),transparent_28%),radial-gradient(circle_at_78%_78%,rgba(207,250,254,0.44),transparent_24%),linear-gradient(180deg,#f8fbff_0%,#edf2f7_52%,#e8eef4_100%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="rounded-[34px] border border-white/80 bg-white/66 p-6 shadow-[0_35px_100px_rgba(148,163,184,0.2)] backdrop-blur-2xl">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/72 px-3 py-1.5 transition hover:bg-white"
            >
              <Sparkles className="size-3.5" />
              Home
            </Link>
            <Link
              href="/library"
              className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/72 px-3 py-1.5 transition hover:bg-white"
            >
              <BookOpen className="size-3.5" />
              Library
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/72 px-3 py-1.5">
              <Eye className="size-3.5" />
              Runtime review
            </div>
          </div>
          <div className="mt-5 space-y-2">
            <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
              {eyebrow}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">{description}</p>
          </div>
        </header>

        <section className="overflow-hidden rounded-[34px] border border-white/80 bg-white/66 shadow-[0_35px_100px_rgba(148,163,184,0.2)] backdrop-blur-2xl">
          {children}
        </section>
      </div>
    </main>
  );
}

export const ActiveRound: Story = {
  render: () => (
    <RuntimeFrame
      eyebrow="Live round"
      title="Pass-and-play should stay calm once the timer starts."
      description="This review surface keeps the runtime visible in Storybook so the active round can be checked for hierarchy, spacing, privacy affordances, and the location reference grid without entering a live room."
    >
      <PlayingPhase
        state={activeRoundState as never}
        allPlayers={players}
        shouldHideSpyCount={false}
        spyCount={1}
        t={translations as never}
      />
    </RuntimeFrame>
  ),
};

export const RevealState: Story = {
  render: () => (
    <RuntimeFrame
      eyebrow="Round reveal"
      title="The reveal state should read like the end of a round, not a crash screen."
      description="This keeps the final reveal reviewable alongside the active round surface, so the transition into results and replay can be judged as part of the same product flow."
    >
      <RevealScreen
        game={revealGame as never}
        playerId="player-1"
        isHost
        passAndPlay
        isRestarting={false}
        onRestart={fn()}
        onLeave={fn()}
      />
    </RuntimeFrame>
  ),
};
