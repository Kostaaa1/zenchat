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
  getCurrentChatRooms: t.procedure
    .input(z.string().nullish())
    .query(async ({ input: userId }) => {
      console.log(userId);

      if (!userId) return;
      const chatrooms = await getCurrentChatRooms(userId);

      return chatrooms;
    }),
  messages: messageRouter,
  history: chatHistoryRouter,
});
