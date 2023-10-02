import { z } from "zod";
import { t } from "../../trpc";
import {
  getChatroomId,
  getCurrentChatRooms,
  getUserIdFromChatroom,
} from "../../utils/supabase/chatroom";
import { chatHistoryRouter } from "./history";
import { messageRouter } from "./messages";

export const chatRouter = t.router({
  getId: t.procedure
    .input(
      z.object({
        userId: z.string(),
        inspectedUserId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { userId, inspectedUserId } = input;
      const path = await getChatroomId(inspectedUserId, userId);

      return path;
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
  messages: messageRouter,
  history: chatHistoryRouter,
});
