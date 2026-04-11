import { LocationCatalogPreview } from "./location-catalog-preview";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ComponentProps } from "react";

const meta = {
  title: "Library/Location Catalog Preview",
  component: LocationCatalogPreview,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LocationCatalogPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

const locations = [
  {
    category: "Entertainment",
    name: "Film Set",
    roles: ["Director", "Stunt Coordinator", "Cinematographer", "Lead Actor"],
  },
  {
    category: "Travel",
    name: "Airport Lounge",
    roles: ["Pilot", "Frequent Flyer", "Barista", "Travel Blogger"],
  },
  {
    category: "Work",
    name: "Startup Office",
    roles: ["Founder", "Engineer", "Designer", "Investor"],
  },
] satisfies ComponentProps<typeof LocationCatalogPreview>["locations"];

export const Default: Story = {
  args: {
    locations,
  },
};

export const Empty: Story = {
  args: {
    locations: [],
    emptyTitle: "No locations matched this source",
    emptyDescription: "Broaden the filters or pick a different collection.",
  },
};
