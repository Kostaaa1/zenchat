import { useState } from "react"
import { trpc } from "./trpcClient"
import { httpBatchLink } from "@trpc/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useAuth } from "@clerk/clerk-react"

const TRPCWrapper = ({ children }: { children: React.ReactNode }) => {
  const { getToken } = useAuth()
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: Infinity
          }
        }
      })
  )

  const { MODE, VITE_SERVER_URL, VITE_DEV_SERVER } = import.meta.env
  const URL = MODE === "development" ? VITE_DEV_SERVER : VITE_SERVER_URL

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${URL}/api/trpc`,
          async headers() {
            return {
              Authorization: `Bearer ${await getToken()}`
            }
          }
          // fetch(url, opts) {
          //   return fetch(url, {
          //     ...opts,
          //     credentials: "include",
          //   });
          // },
        })
      ]
    })
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}

export default TRPCWrapper
