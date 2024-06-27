"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRouter = void 0;
const zod_1 = require("zod");
const trpc_1 = require("../../trpc");
const chatroom_1 = require("../../utils/supabase/chatroom");
const zodSchemas_1 = require("../../types/zodSchemas");
const server_1 = require("@trpc/server");
exports.messageRouter = trpc_1.t.router({
    get: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        chatroom_id: zod_1.z.string(),
    }))
        .query(async ({ input }) => {
        const { chatroom_id } = input;
        if (!chatroom_id)
            return;
        const { data, status } = await (0, chatroom_1.getMessages)(chatroom_id);
        if (status === "error") {
            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: data.message });
        }
        return data;
    }),
    getMore: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        chatroom_id: zod_1.z.string(),
        lastMessageDate: zod_1.z.string(),
    }))
        .mutation(async ({ input }) => {
        const { chatroom_id, lastMessageDate } = input;
        const { data, status } = await (0, chatroom_1.getMoreMessages)(chatroom_id, lastMessageDate);
        if (status === "error") {
            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: data.message });
        }
        return data;
    }),
    send: trpc_1.protectedProcedure.input(zodSchemas_1.MessageSchema).mutation(async ({ input: messageData }) => {
        try {
            const { content, is_image } = messageData;
            if (is_image)
                messageData["content"] = content;
            const res = await (0, chatroom_1.sendMessage)(messageData);
            if (res)
                throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: res.data.message });
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
    triggerReadMessages: trpc_1.protectedProcedure.input(zod_1.z.string()).mutation(async ({ input: id }) => {
        const res = await (0, chatroom_1.triggerReadMessages)(id);
        if (res)
            throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: res.data.message });
    }),
});
//# sourceMappingURL=messages.js.map