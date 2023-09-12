import { z } from "zod";
import { t } from "../../trpc";
import {
  fetchAllMessages,
  getChatroomId,
  getCurrentChatRooms,
  getUserIdFromChatroom,
} from "../../utils/supabase/chatroom";
import { chatHistoryRouter } from "./history";
import { TMessage, chatRoomDataSchema } from "../../types/types";

export const chatRouter = t.router({
  getId: t.procedure
    .input(z.object({ userId: z.string(), inspectedUserId: z.string() }))
    .query(async ({ input }) => {
      console.log("input", input);
      const { userId, inspectedUserId } = input;
      const path = await getChatroomId(inspectedUserId, userId);

      return path;
    }),
  // not implemented
  fetchAllMessages: t.procedure
    .input(
      z.object({ activeChat: chatRoomDataSchema, chatroom_id: z.string() })
    )
    .query(async ({ input }) => {
      const { activeChat, chatroom_id } = input;
      if (!activeChat && !chatroom_id) return;
      const messages = await fetchAllMessages(chatroom_id);

      // if (messages) {
      //   activeChat!.messages = messages;
      // }

      return messages;
    }),
  getUserIdFromChatroom: t.procedure
    .input(z.string())
    .query(async ({ input: chatroom_id }) => {
      const data = await getUserIdFromChatroom(chatroom_id);
      return data;
    }),
  getCurrentChatRooms: t.procedure
    .input(z.string().nullish())
    .query(async ({ input: userId }) => {
      if (!userId) return;

      const chatRooms = await getCurrentChatRooms(userId);
      return chatRooms;
    }),
  //

  history: chatHistoryRouter,
});
