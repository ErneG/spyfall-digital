import { QueryClient } from "@tanstack/react-query";

const STALE_TIME = 5000;
const GC_TIME = 300_000;

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}
