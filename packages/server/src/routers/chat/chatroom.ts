import { z } from "zod";
import { protectedProcedure, t } from "../../trpc";
import { chatHistoryRouter } from "./history";
import { TRPCError } from "@trpc/server";
import { messageRouter } from "./messages";
import {
  getUserChatRooms,
  getChatroomID,
  deleteConversation,
  getChatroomUsersFromID,
} from "../../utils/supabase/chatroom";

export const chatRouter = t.router({
  get: t.router({
    chatroom_id: protectedProcedure
      .input(z.object({ userIds: z.array(z.string()), admin: z.string() }))
      .query(async ({ input: { userIds, admin } }) => {
        const { data, status } = await getChatroomID(userIds, admin);
        if (status === "error") {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: data.message });
        }
        return data;
      }),
    user_chatrooms: protectedProcedure
      .input(z.string().nullish())
      .query(async ({ input: userId }) => {
        if (!userId) return;
        const { data, status } = await getUserChatRooms(userId);
        if (status === "error") {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: data.message });
        }
        return data;
      }),
    chatroom_users: protectedProcedure.input(z.string()).query(async ({ input: chatroom_id }) => {
      const { data, status } = await getChatroomUsersFromID(chatroom_id);
      if (status === "error") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: data.message });
      }
      return data;
    }),
  }),
  delete: protectedProcedure
    .input(z.object({ user_id: z.string(), chatroom_id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const { chatroom_id, user_id } = input;
        const res = await deleteConversation(chatroom_id, user_id);
        if (res && res.status === "error") {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: res.data.message });
        }
      } catch (error) {
        console.log("EROORO: :  , ", error);
      }
    }),
  messages: messageRouter,
  history: chatHistoryRouter,
});
