"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense, useState } from "react";

import { I18nProvider } from "@/shared/i18n/context";
import { makeQueryClient } from "@/shared/lib/query-client";

const ReactQueryDevtools =
  process.env.NODE_ENV === "development"
    ? lazy(async () => {
        const devtoolsModule = await import("@tanstack/react-query-devtools");
        return { default: devtoolsModule.ReactQueryDevtools };
      })
    : null;

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>{children}</I18nProvider>
      {ReactQueryDevtools ? (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
        </Suspense>
      ) : null}
    </QueryClientProvider>
  );
}
