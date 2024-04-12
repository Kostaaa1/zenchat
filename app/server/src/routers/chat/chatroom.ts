import { z } from "zod";
import { t } from "../../trpc";
import {
  deleteConversation,
  getChatroomId,
  getCurrentChatroom,
  getUserChatRooms,
} from "../../utils/supabase/chatroom";
import { chatHistoryRouter } from "./history";
import { messageRouter } from "./messages";
import { TChatroom } from "../../types/types";

export const chatRouter = t.router({
  get: t.router({
    chatroom_id: t.procedure
      .input(z.object({ userIds: z.array(z.string()), admin: z.string() }))
      .query(async ({ input: { admin, userIds } }) => {
        const path = await getChatroomId(userIds, admin);
        return path;
      }),
    user_chatrooms: t.procedure
      .input(z.string().nullish())
      .query(async ({ input: userId }) => {
        if (!userId) return;

        const chatrooms = await getUserChatRooms(userId);
        return chatrooms;
      }),
    currentChatRoom: t.procedure
      .input(z.object({ user_id: z.string(), chatroom_id: z.string() }))
      .query(async ({ input }) => {
        const currentChatroom = await getCurrentChatroom(input);
        return currentChatroom;
      }),
  }),
  delete: t.procedure.input(z.string()).mutation(async ({ input }) => {
    console.log("DSADJISJAIDJISAJIDSA IDDD", input);
    await deleteConversation(input);
    return "yooo";
  }),
  messages: messageRouter,
  history: chatHistoryRouter,
});
