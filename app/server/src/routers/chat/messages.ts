import { z } from "zod";
import { t } from "../../trpc";
import {
  getMessages,
  getMoreMessages,
  sendMessage,
  unsendMessage,
} from "../../utils/supabase/chatroom";
import { messageSchema, userSchema } from "../../types/zodSchemas";

export const messageRouter = t.router({
  get: t.procedure
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
  getMore: t.procedure
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
  send: t.procedure
    .input(messageSchema)
    .mutation(async ({ input: messageData }) => {
      try {
        await sendMessage(messageData);
      } catch (error) {
        console.log(error);
      }
    }),
  unsend: t.procedure
    .input(z.object({ id: z.string(), imageUrl: z.string().nullable() }))
    .mutation(async ({ input }) => {
      console.log(input);
      await unsendMessage(input);
    }),
  sendGroupMessage: t.procedure
    .input(z.array(userSchema))
    .mutation(({ input }) => {
      console.log(input);
    }),
});
