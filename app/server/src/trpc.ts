import { TRPCError, inferAsyncReturnType, initTRPC } from "@trpc/server";
import { ZodError } from "zod";
import { createContext } from "./context";
import { decodeAndVerifyToken } from "./utils/jwt/decodeAndVerifyToken";

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

const isAuthed = t.middleware(({ next, ctx }) => {
  const session = decodeAndVerifyToken(ctx.req, ctx.res);
  if (!session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session,
    },
  });
});
export const protectedProcedure = t.procedure.use(isAuthed);
