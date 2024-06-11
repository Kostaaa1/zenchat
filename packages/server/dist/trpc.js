"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectedProcedure = exports.t = void 0;
const server_1 = require("@trpc/server");
const zod_1 = require("zod");
const decodeAndVerifyToken_1 = require("./utils/jwt/decodeAndVerifyToken");
exports.t = server_1.initTRPC.context().create({
    errorFormatter(opts) {
        const { shape, error } = opts;
        return {
            ...shape,
            data: {
                ...shape.data,
                zodError: error.code === "BAD_REQUEST" && error.cause instanceof zod_1.ZodError
                    ? error.cause.flatten()
                    : null,
            },
        };
    },
});
const isAuthed = exports.t.middleware(({ next, ctx }) => {
    const { req, res } = ctx;
    const session = (0, decodeAndVerifyToken_1.decodeAndVerifyToken)(req, res);
    if (!session) {
        throw new server_1.TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
        ctx: {
            session,
        },
    });
});
exports.protectedProcedure = exports.t.procedure.use(isAuthed);
//# sourceMappingURL=trpc.js.map