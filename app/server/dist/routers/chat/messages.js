"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRouter = void 0;
const zod_1 = require("zod");
const trpc_1 = require("../../trpc");
const chatroom_1 = require("../../utils/supabase/chatroom");
const zodSchemas_1 = require("../../types/zodSchemas");
exports.messageRouter = trpc_1.t.router({
    get: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        chatroom_id: zod_1.z.string(),
    }))
        .query(async ({ input }) => {
        const { chatroom_id } = input;
        if (!chatroom_id)
            return;
        const messages = await (0, chatroom_1.getMessages)(chatroom_id);
        return messages;
    }),
    getMore: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        chatroom_id: zod_1.z.string(),
        lastMessageDate: zod_1.z.string(),
    }))
        .mutation(async ({ input }) => {
        const { chatroom_id, lastMessageDate } = input;
        if (!chatroom_id)
            return;
        const messages = await (0, chatroom_1.getMoreMessages)(chatroom_id, lastMessageDate);
        return messages;
    }),
    send: trpc_1.protectedProcedure.input(zodSchemas_1.MessageSchema).mutation(async ({ input: messageData }) => {
        try {
            await (0, chatroom_1.sendMessage)(messageData);
        }
        catch (error) {
            console.log(error);
        }
    }),
    unsend: trpc_1.protectedProcedure
        .input(zod_1.z.object({ id: zod_1.z.string(), imageUrl: zod_1.z.string().nullable() }))
        .mutation(async ({ input }) => {
        await (0, chatroom_1.unsendMessage)(input);
    }),
    sendGroupMessage: trpc_1.protectedProcedure.input(zod_1.z.array(zodSchemas_1.UserSchema)).mutation(({ input }) => {
        console.log(input);
    }),
});
//# sourceMappingURL=messages.js.map