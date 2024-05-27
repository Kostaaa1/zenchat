import { z } from "zod";
import { protectedProcedure, t } from "../../trpc";
import { chatHistoryRouter } from "./history";
import { messageRouter } from "./messages";
import {
  getUserChatRooms,
  getChatroomId,
  deleteConversation,
} from "../../utils/supabase/chatroom";

export const chatRouter = t.router({
  get: t.router({
    chatroom_id: protectedProcedure
      .input(z.object({ userIds: z.array(z.string()), admin: z.string() }))
      .query(async ({ input: { userIds, admin } }) => {
        console.log("Called getChatRoomId");
        const chatroomId = await getChatroomId(userIds, admin);
        return chatroomId;
      }),
    user_chatrooms: protectedProcedure
      .input(z.string().nullish())
      .query(async ({ input: userId }) => {
        if (!userId) return;
        const chatrooms = await getUserChatRooms(userId);
        return chatrooms;
      }),
  }),
  delete: protectedProcedure
    .input(z.object({ user_id: z.string(), chatroom_id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const { chatroom_id, user_id } = input;
        await deleteConversation(chatroom_id, user_id);
      } catch (error) {
        console.log("EROORO: :  , ", error);
      }
    }),
  messages: messageRouter,
  history: chatHistoryRouter,
});
