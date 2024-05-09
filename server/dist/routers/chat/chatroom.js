"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRouter = void 0;
const zod_1 = require("zod");
const trpc_1 = require("../../trpc");
const history_1 = require("./history");
const messages_1 = require("./messages");
const chatroom_1 = require("../../utils/supabase/chatroom");
exports.chatRouter = trpc_1.t.router({
    get: trpc_1.t.router({
        chatroom_id: trpc_1.protectedProcedure
            .input(zod_1.z.object({ userIds: zod_1.z.array(zod_1.z.string()), admin: zod_1.z.string() }))
            .query(async ({ input: { userIds, admin } }) => {
            const chatroomId = await (0, chatroom_1.getChatroomId)(userIds, admin);
            return chatroomId;
        }),
        user_chatrooms: trpc_1.protectedProcedure
            .input(zod_1.z.string().nullish())
            .query(async ({ input: userId }) => {
            if (!userId)
                return;
            const chatrooms = await (0, chatroom_1.getUserChatRooms)(userId);
            return chatrooms;
        }),
    }),
    delete: trpc_1.protectedProcedure
        .input(zod_1.z.object({ user_id: zod_1.z.string(), chatroom_id: zod_1.z.string() }))
        .mutation(async ({ input }) => {
        try {
            const { chatroom_id, user_id } = input;
            await (0, chatroom_1.deleteConversation)(chatroom_id, user_id);
        }
        catch (error) {
            console.log("EROORO: :  , ", error);
        }
    }),
    messages: messages_1.messageRouter,
    history: history_1.chatHistoryRouter,
});
//# sourceMappingURL=chatroom.js.map