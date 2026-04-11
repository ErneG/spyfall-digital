import { PlayerList } from "./player-list";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Online Room/Player List",
  component: PlayerList,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PlayerList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LobbyReady: Story = {
  args: {
    currentPlayerId: "player-2",
    players: [
      { id: "player-1", name: "Avery", isHost: true, isOnline: true },
      { id: "player-2", name: "Jordan", isHost: false, isOnline: true },
      { id: "player-3", name: "Casey", isHost: false, isOnline: true },
      { id: "player-4", name: "Morgan", isHost: false, isOnline: false },
    ],
  },
};

export const WaitingState: Story = {
  args: {
    currentPlayerId: "player-1",
    players: [],
  },
};
