import { fn } from "storybook/test";

import {
  AddLocationForm,
  CollectionLocationRow,
  SavedLocationImportList,
} from "./collection-editor-parts";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Library/Collections/Editor Parts",
  component: CollectionLocationRow,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CollectionLocationRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CurrentLocation: Story = {
  args: {
    location: {
      id: "collection-location-1",
      name: "Backroom Poker Table",
      allSpies: false,
      roles: [
        { id: "role-1", name: "Dealer" },
        { id: "role-2", name: "Pit Boss" },
        { id: "role-3", name: "Counterfeit Courier" },
      ],
    },
    onRemove: fn(),
  },
};

export const SavedImports: Story = {
  render: () => (
    <div className="w-full max-w-3xl">
      <SavedLocationImportList
        existingLocationNames={["Backroom Poker Table"]}
        importingId={null}
        onImport={fn()}
        savedLocations={[
          {
            id: "saved-1",
            name: "Backroom Poker Table",
            category: "Entertainment",
            allSpies: false,
            roles: [
              { id: "role-1", name: "Dealer" },
              { id: "role-2", name: "Pit Boss" },
            ],
          },
          {
            id: "saved-2",
            name: "Witness Safe House",
            category: "Travel",
            allSpies: true,
            roles: [],
          },
        ]}
      />
    </div>
  ),
};

export const ManualEntry: Story = {
  render: () => (
    <div className="w-full max-w-2xl">
      <AddLocationForm onAdd={() => Promise.resolve(undefined)} />
    </div>
  ),
};
