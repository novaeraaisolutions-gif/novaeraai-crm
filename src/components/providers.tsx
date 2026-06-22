"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // staleTime alto causava dados velhos após criar/editar
            // (ex: tarefa criada não aparecia em /tasks até refresh manual).
            // Com 0 + refetchOnMount "always", toda navegação refaz a query.
            staleTime: 0,
            refetchOnMount: "always",
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
