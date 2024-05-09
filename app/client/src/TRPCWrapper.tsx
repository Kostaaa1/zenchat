import { useState } from "react";
import { trpc } from "./utils/trpcClient";
import { httpBatchLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";

const TRPCWrapper = ({ children }: { children: React.ReactNode }) => {
  const { getToken } = useAuth();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: Infinity,
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${import.meta.env.VITE_SERVER_URL}/api/trpc`,
          async headers() {
            return {
              Authorization: `Bearer ${await getToken()}`,
            };
          },
          // fetch(url, opts) {
          //   return fetch(url, {
          //     ...opts,
          //     credentials: "include",
          //   });
          // },
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};

export default TRPCWrapper;
