import { z } from "zod";
import { protectedProcedure, t } from "../../trpc";
import {
  createChatRoom,
  insertUserChatroom,
  getChatroomData,
  getUserChatRooms,
  getChatroomId,
  deleteConversation,
} from "../../utils/supabase/chatroom";
import { chatHistoryRouter } from "./history";
import { messageRouter } from "./messages";
import supabase from "../../config/supabase";
import { deleteImageFromS3 } from "../../middleware/multer";
import { Database } from "../../types/supabase";
import { TChatroom } from "../../types/types";

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
    currentChatRoom: protectedProcedure
      .input(z.object({ user_id: z.string(), chatroom_id: z.string() }))
      .query(async ({ input }) => {
        const { chatroom_id, user_id } = input;
        const chatData = await getChatroomData(chatroom_id, user_id);
        return { ...chatData, img_urls: [], new_message: "" } as TChatroom & {
          img_urls: string[];
          new_message: string;
        };
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
