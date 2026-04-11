import { fn } from "storybook/test";

import { StartSection } from "./start-section";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Online Room/Start Section",
  component: StartSection,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof StartSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const HostReady: Story = {
  args: {
    isHost: true,
    isStarting: false,
    playerCount: 5,
    error: "",
    onStart: fn(),
  },
};

export const NeedMorePlayers: Story = {
  args: {
    ...HostReady.args,
    playerCount: 2,
  },
};

export const WaitingForHost: Story = {
  args: {
    ...HostReady.args,
    isHost: false,
  },
};
