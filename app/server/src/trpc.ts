import { initTRPC } from "@trpc/server";
import { ZodError } from "zod";
export const t = initTRPC.context().create({
  errorFormatter(opts) {
    console.log("OPTS LOG", opts);
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
