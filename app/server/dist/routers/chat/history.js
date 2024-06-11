"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatHistoryRouter = void 0;
const zod_1 = require("zod");
const trpc_1 = require("../../trpc");
const chatroom_1 = require("../../utils/supabase/chatroom");
exports.chatHistoryRouter = trpc_1.t.router({
    getAll: trpc_1.protectedProcedure.input(zod_1.z.string()).query(async ({ input: id }) => {
        const userChatHistory = await (0, chatroom_1.getSearchedHistory)(id);
        return userChatHistory;
    }),
    addUser: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        main_user_id: zod_1.z.string(),
        user_id: zod_1.z.string(),
    }))
        .mutation(async ({ input }) => {
        const { main_user_id, user_id } = input;
        await (0, chatroom_1.addUserToChatHistory)({ main_user_id, user_id });
    }),
    removeUser: trpc_1.protectedProcedure.input(zod_1.z.string()).mutation(async ({ input }) => {
        await (0, chatroom_1.deleteSearchChat)(input);
    }),
    clearChatHistory: trpc_1.protectedProcedure.input(zod_1.z.string()).mutation(async ({ input: id }) => {
        await (0, chatroom_1.deleteAllSearchedChats)(id);
    }),
});
//# sourceMappingURL=history.js.map