import { TRPCError, inferAsyncReturnType, initTRPC } from "@trpc/server";
import { ZodError } from "zod";
import { createContext } from "./context";
// @ts-ignore
import Cookies from "cookies";
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
  console.log("REQUEST: ", ctx.req);
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
// export const protectedProcedure = t.procedure.use(isAuthed);

export const protectedProcedure = t.procedure.use(
  t.middleware(({ next, ctx }) => {
    const { req, res } = ctx;
    console.log(req);
    // const cookies = new Cookies(req, res);
    // console.log(cookies);
    return next();
  })
);
