import {
  createTRPCProxyClient,
  createTRPCReact,
  httpBatchLink,
  httpLink,
} from "@trpc/react-query";
import type { AppRouter } from "../../../server/src/index";

export const trpc = createTRPCReact<AppRouter>();
