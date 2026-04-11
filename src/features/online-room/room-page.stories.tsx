import { BookMarked, Layers3 } from "lucide-react";
import { fn } from "storybook/test";

import { GameConfigSummary } from "./components/game-config-parts";
import { PlayerList } from "./components/player-list";
import { RoomCodeHeader } from "./components/room-code-header";
import { StartSection } from "./components/start-section";

import type { PlayerInfo } from "@/shared/types/common";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Online Room/Room Lobby",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RoomLobbyReviewSurface>;

export default meta;

type Story = StoryObj<typeof meta>;

interface RoomLobbyReviewSurfaceProps {
  code: string;
  currentPlayerId: string;
  isConnected: boolean;
  isCopied: boolean;
  isHost: boolean;
  isStarting: boolean;
  playerCount: number;
  moderatorMode: boolean;
  autoStartTimer: boolean;
  hideSpyCount: boolean;
  spyCount: number;
  selectedLocationCount: number;
  totalLocationCount: number;
  timeLimit: number;
  error: string;
  players: PlayerInfo[];
}

function RoomLobbyReviewSurface({
  code,
  currentPlayerId,
  isConnected,
  isCopied,
  isHost,
  isStarting,
  playerCount,
  moderatorMode,
  autoStartTimer,
  hideSpyCount,
  spyCount,
  selectedLocationCount,
  totalLocationCount,
  timeLimit,
  error,
  players,
}: RoomLobbyReviewSurfaceProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eef3f8] text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),rgba(255,255,255,0.6)_30%,transparent_54%),radial-gradient(circle_at_85%_14%,rgba(191,219,254,0.55),transparent_28%),radial-gradient(circle_at_78%_78%,rgba(207,250,254,0.42),transparent_24%),linear-gradient(180deg,#f8fbff_0%,#edf2f7_52%,#e8eef4_100%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="rounded-[34px] border border-white/80 bg-white/66 p-6 shadow-[0_35px_100px_rgba(148,163,184,0.2)] backdrop-blur-2xl">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/72 px-3 py-1.5">
              <Layers3 className="size-3.5" />
              Online room
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/72 px-3 py-1.5">
              <BookMarked className="size-3.5" />
              Live lobby
            </div>
          </div>
          <div className="mt-5 space-y-2">
            <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
              Shared-device control room
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Gather the room before the round starts.
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              This lobby view keeps the host workflow calm and lightweight: room code, player list,
              source summary, and the start gate all stay visible together.
            </p>
          </div>
        </header>

        <section className="rounded-[34px] border border-white/80 bg-white/66 p-6 shadow-[0_35px_100px_rgba(148,163,184,0.2)] backdrop-blur-2xl">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.86fr)]">
            <div className="space-y-5">
              <RoomCodeHeader
                code={code}
                isCopied={isCopied}
                isConnected={isConnected}
                onCopy={fn()}
              />

              <div className="rounded-[28px] border border-white/80 bg-white/78 p-5 shadow-[0_18px_45px_rgba(148,163,184,0.12)]">
                <p className="text-[11px] tracking-[0.16em] text-slate-500 uppercase">
                  Room source
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div
                    className={`rounded-[24px] border p-4 ${
                      selectedLocationCount === totalLocationCount
                        ? "border-sky-200 bg-sky-50"
                        : "border-white/80 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                      <Layers3 className="size-4" />
                      Built-in catalog
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {selectedLocationCount} / {totalLocationCount} locations selected
                    </p>
                  </div>
                  <div
                    className={`rounded-[24px] border p-4 ${
                      moderatorMode ? "border-sky-200 bg-sky-50" : "border-white/80 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                      <BookMarked className="size-4" />
                      Library collections
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {moderatorMode
                        ? "Moderator mode keeps the lobby source controls flexible."
                        : "Collections can be applied without leaving the room."}
                    </p>
                  </div>
                </div>
              </div>

              <GameConfigSummary
                timeLimit={timeLimit}
                spyCount={spyCount}
                selectedLocationCount={selectedLocationCount}
                totalLocationCount={totalLocationCount}
                moderatorMode={moderatorMode}
              />
            </div>

            <div className="space-y-5">
              <PlayerList players={players} currentPlayerId={currentPlayerId} />
              <StartSection
                isHost={isHost}
                isStarting={isStarting}
                playerCount={playerCount}
                error={error}
                onStart={fn()}
              />
              <div className="rounded-[28px] border border-white/80 bg-white/78 p-5 shadow-[0_18px_45px_rgba(148,163,184,0.12)]">
                <p className="text-[11px] tracking-[0.16em] text-slate-500 uppercase">Lobby mood</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {isHost
                    ? "The room is ready to start once the host is happy with the player count and source."
                    : "Guests get a quieter view that focuses on waiting, joining, and staying in sync."}
                </p>
                <p className="mt-4 text-xs font-medium text-slate-500">
                  {autoStartTimer ? "Auto-start timer is on." : "Auto-start timer is off."}{" "}
                  {hideSpyCount
                    ? "Spy count stays hidden until reveal."
                    : "Spy count is shown in the lobby."}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export const HostLobby: Story = {
  args: {
    code: "ABCDE",
    currentPlayerId: "player-2",
    isConnected: true,
    isCopied: false,
    isHost: true,
    isStarting: false,
    playerCount: 5,
    moderatorMode: true,
    autoStartTimer: false,
    hideSpyCount: false,
    spyCount: 2,
    selectedLocationCount: 18,
    totalLocationCount: 24,
    timeLimit: 480,
    error: "",
    players: [
      { id: "player-1", name: "Avery", isHost: true, isOnline: true },
      { id: "player-2", name: "Jordan", isHost: false, isOnline: true },
      { id: "player-3", name: "Casey", isHost: false, isOnline: true },
      { id: "player-4", name: "Morgan", isHost: false, isOnline: true },
      { id: "player-5", name: "Riley", isHost: false, isOnline: false },
    ],
  },
  render: (args) => <RoomLobbyReviewSurface {...args} />,
};

export const GuestLobby: Story = {
  args: {
    code: "ABCDE",
    currentPlayerId: "player-3",
    isConnected: false,
    isCopied: false,
    isHost: false,
    isStarting: false,
    playerCount: 0,
    moderatorMode: false,
    autoStartTimer: false,
    hideSpyCount: true,
    spyCount: 1,
    selectedLocationCount: 12,
    totalLocationCount: 24,
    timeLimit: 420,
    error: "Waiting for the host to start the round.",
    players: [
      { id: "player-1", name: "Avery", isHost: true, isOnline: true },
      { id: "player-2", name: "Jordan", isHost: false, isOnline: false },
      { id: "player-3", name: "Casey", isHost: false, isOnline: true },
    ],
  },
  render: (args) => <RoomLobbyReviewSurface {...args} />,
};
