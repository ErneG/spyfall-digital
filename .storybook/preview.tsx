import { QueryClientProvider } from "@tanstack/react-query";
import type { Preview } from "@storybook/nextjs-vite";
import { useState } from "react";
import type { ReactNode } from "react";

import "../src/app/globals.css";
import { I18nProvider } from "../src/shared/i18n/context";
import { makeQueryClient } from "../src/shared/lib/query-client";

function StorybookProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>{children}</I18nProvider>
    </QueryClientProvider>
  );
}

export function renderInStorybookShell(children: ReactNode) {
  return (
    <StorybookProviders>
      <div data-testid="storybook-shell" className="min-h-screen bg-[#eef3f8] p-6 text-slate-950">
        {children}
      </div>
    </StorybookProviders>
  );
}

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "app",
      values: [
        { name: "app", value: "#eef3f8" },
        { name: "paper", value: "#ffffff" },
        { name: "mist", value: "#f8fbff" },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "error",
    },
    options: {
      storySort: {
        order: ["Library", "Pass & Play", "Online Room", "Game", "Shared"],
      },
    },
  },
  decorators: [(Story) => renderInStorybookShell(<Story />)],
};

export default preview;
