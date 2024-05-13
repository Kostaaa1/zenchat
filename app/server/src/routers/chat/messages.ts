import { z } from "zod";
import { protectedProcedure, t } from "../../trpc";
import {
  getMessages,
  getMoreMessages,
  sendMessage,
  unsendMessage,
} from "../../utils/supabase/chatroom";
import { MessageSchema, UserSchema } from "../../types/zodSchemas";

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
      const messages = await getMessages(chatroom_id);
      return messages;
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
      if (!chatroom_id) return;
      const messages = await getMoreMessages(chatroom_id, lastMessageDate);
      return messages;
    }),
  send: protectedProcedure.input(MessageSchema).mutation(async ({ input: messageData }) => {
    try {
      await sendMessage(messageData);
    } catch (error) {
      console.log(error);
    }
  }),
  unsend: protectedProcedure
    .input(z.object({ id: z.string(), imageUrl: z.string().nullable() }))
    .mutation(async ({ input }) => {
      await unsendMessage(input);
    }),
  sendGroupMessage: protectedProcedure.input(z.array(UserSchema)).mutation(({ input }) => {
    console.log(input);
  }),
});
