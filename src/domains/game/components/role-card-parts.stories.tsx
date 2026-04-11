import { useState } from "react";

import { RoleCard, StaticCardBack } from "./role-card-parts";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Pass & Play/Role Card",
  component: RoleCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RoleCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FaceDown: Story = {
  render: () => <StaticCardBack playerName="Avery" remaining={2} />,
};

export const AgentReveal: Story = {
  render: () => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
      <RoleCard
        playerName="Avery"
        role={{
          isSpy: false,
          location: "Embassy",
          myRole: "Ambassador",
        }}
        isFlipped={isFlipped}
        isLoading={false}
        remaining={2}
        onFlip={() => setIsFlipped(true)}
      />
    );
  },
};

export const SpyReveal: Story = {
  render: () => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
      <RoleCard
        playerName="Jordan"
        role={{
          isSpy: true,
          location: null,
          myRole: null,
        }}
        isFlipped={isFlipped}
        isLoading={false}
        remaining={1}
        onFlip={() => setIsFlipped(true)}
      />
    );
  },
};
