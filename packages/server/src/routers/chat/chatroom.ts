import { z } from "zod";
import { protectedProcedure, t } from "../../trpc";
import { chatHistoryRouter } from "./history";
import { messageRouter } from "./messages";
import {
  getUserChatRooms,
  getChatroomId,
  deleteConversation,
  getChatroomUsersFromID,
} from "../../utils/supabase/chatroom";
import { TRPCError } from "@trpc/server";

export const chatRouter = t.router({
  get: t.router({
    chatroom_id: protectedProcedure
      .input(z.object({ userIds: z.array(z.string()), admin: z.string() }))
      .query(async ({ input: { userIds, admin } }) => {
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
    chatroom_users: protectedProcedure.input(z.string()).query(async ({ input: chatroom_id }) => {
      const { data, status } = await getChatroomUsersFromID(chatroom_id);
      if (status === "error") {
        throw new TRPCError({ code: "UNPROCESSABLE_CONTENT", message: data.message });
      }
      return data;
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
