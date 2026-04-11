import { SavedLocationManager } from "./saved-location-manager";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ComponentProps } from "react";

const meta = {
  title: "Library/Saved Location Manager",
  component: SavedLocationManager,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SavedLocationManager>;

export default meta;

type Story = StoryObj<typeof meta>;

const locations = [
  {
    id: "saved-location-1",
    name: "Nightclub Office",
    category: "Entertainment",
    allSpies: false,
    roles: [
      { id: "role-1", name: "Club Owner" },
      { id: "role-2", name: "Bookkeeper" },
      { id: "role-3", name: "Doorman" },
    ],
    updatedAt: "2026-04-10T10:00:00.000Z",
  },
  {
    id: "saved-location-2",
    name: "Safe House",
    category: "Transportation",
    allSpies: true,
    roles: [],
    updatedAt: "2026-04-08T09:30:00.000Z",
  },
] satisfies ComponentProps<typeof SavedLocationManager>["locations"];

export const Default: Story = {
  args: {
    locations,
    error: null,
    isDeleting: false,
    isLoading: false,
    isSaving: false,
    onDelete: () => Promise.resolve({ deleted: true }),
    onSave: (input) =>
      Promise.resolve({
        id: input.id ?? "saved-location-story",
        name: input.name,
        category: input.category,
        allSpies: input.allSpies,
        roles: input.roles.map((role, index) => ({
          id: `saved-location-role-${String(index)}`,
          name: role,
        })),
        updatedAt: "2026-04-11T12:00:00.000Z",
      }),
  },
};

export const Empty: Story = {
  args: {
    ...Default.args,
    locations: [],
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    locations: [],
    isLoading: true,
  },
};
