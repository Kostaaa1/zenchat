"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const zod_1 = require("zod");
const trpc_1 = require("../trpc");
const user_1 = require("../utils/supabase/user");
const zodSchemas_1 = require("../types/zodSchemas");
const server_1 = require("@trpc/server");
exports.userRouter = trpc_1.t.router({
    get: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        data: zod_1.z.string(),
        type: zod_1.z.literal("userId").or(zod_1.z.literal("email")).or(zod_1.z.literal("username")),
    }))
        .query(async ({ input }) => {
        if (!input)
            return;
        let userData = await (0, user_1.getUser)(input);
        return userData;
    }),
    search: trpc_1.protectedProcedure
        .input(zod_1.z.object({ username: zod_1.z.string(), searchValue: zod_1.z.string() }))
        .query(async ({ input }) => {
        const { searchValue, username } = input;
        const searchedUsers = await (0, user_1.getSeachedUsers)(username, searchValue);
        return searchedUsers;
    }),
    updateAvatar: trpc_1.protectedProcedure
        .input(zod_1.z.object({ userId: zod_1.z.string(), image_url: zod_1.z.string() }))
        .mutation(async ({ input }) => {
        const req = await (0, user_1.updateUserAvatar)(input);
        return req;
    }),
    updateUserData: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        userId: zod_1.z.string(),
        userData: zod_1.z.object({
            username: zod_1.z.string().optional(),
            last_name: zod_1.z.string().optional(),
            first_name: zod_1.z.string().optional(),
            description: zod_1.z.string().optional(),
            image_url: zod_1.z.string().optional(),
        }),
    }))
        .mutation(async ({ input }) => {
        const { userData, userId } = input;
        const response = await (0, user_1.updateUserData)(userId, userData);
        if (!response.success) {
            throw new server_1.TRPCError({ code: "UNPROCESSABLE_CONTENT", message: response.message });
        }
        return response.data;
    }),
    create: trpc_1.protectedProcedure.input(zodSchemas_1.CreateUserSchema).mutation(async ({ input }) => {
        try {
            const { email, firstName, lastName, username } = input;
            const userData = await (0, user_1.createUser)({
                email,
                firstName,
                lastName,
                username,
            });
            return userData;
        }
        catch (error) {
            console.log(error);
        }
    }),
});
//# sourceMappingURL=user.js.map