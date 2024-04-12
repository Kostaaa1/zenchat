import { TRPCError, inferAsyncReturnType, initTRPC } from "@trpc/server";
import { ZodError } from "zod";
import { createContext } from "./context";

export const t = initTRPC.context<inferAsyncReturnType<typeof createContext>>().create({
  errorFormatter(opts) {
    const { shape, error } = opts;
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === "BAD_REQUEST" && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  },
});
