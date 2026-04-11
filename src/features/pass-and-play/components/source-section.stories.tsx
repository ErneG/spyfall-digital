import { fn } from "storybook/test";

import { PassAndPlaySourceSection } from "./source-section";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Pass & Play/Source Section",
  component: PassAndPlaySourceSection,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PassAndPlaySourceSection>;

export default meta;

type Story = StoryObj<typeof meta>;

const collections = [
  {
    id: "collection-1",
    name: "Underworld",
    description: "Mafia-coded rooms and cover stories",
    locationCount: 5,
    createdAt: "2026-04-10T10:00:00.000Z",
  },
  {
    id: "collection-2",
    name: "Embassies",
    description: "Diplomatic pressure and intelligence leaks",
    locationCount: 3,
    createdAt: "2026-04-09T10:00:00.000Z",
  },
];

export const BuiltInCatalog: Story = {
  args: {
    collections,
    isAuthenticated: true,
    isLoadingCollections: false,
    source: {
      kind: "built-in",
      categories: ["Transportation", "Workplace", "Entertainment"],
    },
    onSourceChange: fn(),
  },
};

export const CollectionSource: Story = {
  args: {
    ...BuiltInCatalog.args,
    source: {
      kind: "collection",
      collectionId: "collection-1",
    },
  },
};

export const SignInRequired: Story = {
  args: {
    ...BuiltInCatalog.args,
    collections: [],
    isAuthenticated: false,
  },
};
