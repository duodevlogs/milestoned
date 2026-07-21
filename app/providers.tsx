"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/*
 * Client-side providers. Only non-sensitive UI/server-mirror state lives on
 * the client: TanStack Query caches data the user is already authorized to
 * see (their own documents, their own credit balance). Secrets and API keys
 * never enter client state — they exist only in server-side code.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
