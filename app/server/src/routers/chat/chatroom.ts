import { z } from "zod";
import { t } from "../../trpc";
import {
  getChatroomId,
  getCurrentChatRoom,
  getUserChatRooms,
  getUserIdFromChatroom,
} from "../../utils/supabase/chatroom";
import { chatHistoryRouter } from "./history";
import { messageRouter } from "./messages";

export const chatRouter = t.router({
  getChatroomId: t.procedure
    .input(z.array(z.string()))
    .query(async ({ input: userIds }) => {
      console.log("Get CHATROOM ID CALLED: ", userIds);
      const path = await getChatroomId(userIds);

      return path;
    }),
  getUserIdFromChatroom: t.procedure
    .input(z.string())
    .query(async ({ input: chatroom_id }) => {
      const data = await getUserIdFromChatroom(chatroom_id);

      return data;
    }),
  getUserChatrooms: t.procedure
    .input(z.string().nullish())
    .query(async ({ input: userId }) => {
      console.log(userId);

      if (!userId) return;
      const chatrooms = await getUserChatRooms(userId);
      return chatrooms;
    }),
  getCurrentChatroom: t.procedure
    .input(z.object({ chatroom_id: z.string(), user_id: z.string() }))
    .query(async ({ input }) => {
      const { chatroom_id, user_id } = input;
      if (!chatroom_id || !user_id) return;

      const currentChatRoom = await getCurrentChatRoom(chatroom_id, user_id);
      return currentChatRoom;
    }),
  messages: messageRouter,
  history: chatHistoryRouter,
});
