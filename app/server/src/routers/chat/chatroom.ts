import { z } from "zod";
import { protectedProcedure, t } from "../../trpc";
import {
  deleteConversation,
  getChatroomId,
  getCurrentChatroom,
  getUserChatRooms,
} from "../../utils/supabase/chatroom";
import { chatHistoryRouter } from "./history";
import { messageRouter } from "./messages";

export const chatRouter = t.router({
  get: t.router({
    chatroom_id: protectedProcedure
      .input(z.object({ userIds: z.array(z.string()), admin: z.string() }))
      .query(async ({ input: { admin, userIds } }) => {
        const path = await getChatroomId(userIds, admin);
        return path;
      }),
    user_chatrooms: protectedProcedure
      .input(z.string().nullish())
      .query(async ({ input: userId }) => {
        if (!userId) return;
        const chatrooms = await getUserChatRooms(userId);
        return chatrooms;
      }),
    currentChatRoom: protectedProcedure
      .input(z.object({ user_id: z.string(), chatroom_id: z.string() }))
      .query(async ({ input }) => {
        const currentChatroom = await getCurrentChatroom(input);
        return currentChatroom;
      }),
  }),
  delete: protectedProcedure
    .input(z.object({ user_id: z.string(), chatroom_id: z.string() }))
    .mutation(async ({ input }) => {
      const { chatroom_id, user_id } = input;
      await deleteConversation(input);
    }),
  messages: messageRouter,
  history: chatHistoryRouter,
});
