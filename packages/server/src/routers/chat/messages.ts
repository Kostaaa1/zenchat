import { z } from "zod";
import { protectedProcedure, t } from "../../trpc";
import {
  getMessages,
  getMoreMessages,
  sendMessage,
  triggerReadMessages,
  unsendMessage,
} from "../../utils/supabase/chatroom";
import { MessageSchema } from "../../types/zodSchemas";
import { TRPCError } from "@trpc/server";

export const messageRouter = t.router({
  get: protectedProcedure
    .input(
      z.object({
        chatroom_id: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { chatroom_id } = input;
      if (!chatroom_id) return;
      const { data, status } = await getMessages(chatroom_id);
      if (status === "error") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: data.message });
      }
      return data;
    }),
  getMore: protectedProcedure
    .input(
      z.object({
        chatroom_id: z.string(),
        lastMessageDate: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { chatroom_id, lastMessageDate } = input;
      const { data, status } = await getMoreMessages(chatroom_id, lastMessageDate);
      if (status === "error") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: data.message });
      }
      return data;
    }),
  send: protectedProcedure.input(MessageSchema).mutation(async ({ input: messageData }) => {
    try {
      const { content, is_image } = messageData;
      if (is_image) messageData["content"] = content;
      const res = await sendMessage(messageData);
      if (res) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: res.data.message });
    } catch (error) {
      console.log(error);
    }
  }),
  unsend: protectedProcedure
    .input(z.object({ id: z.string(), imageUrl: z.string().nullable() }))
    .mutation(async ({ input }) => {
      await unsendMessage(input);
    }),
  triggerReadMessages: protectedProcedure.input(z.string()).mutation(async ({ input: id }) => {
    const res = await triggerReadMessages(id);
    if (res) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: res.data.message });
  }),
});
