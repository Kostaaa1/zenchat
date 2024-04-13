import { z } from "zod";
import { t, protectedProcedure } from "../../trpc";
import {
  addUserToChatHistory,
  deleteAllSearchedChats,
  deleteSearchChat,
  getSearchedHistory,
} from "../../utils/supabase/chatroom";

export const chatHistoryRouter = t.router({
  getAll: protectedProcedure.input(z.string()).query(async ({ input: id }) => {
    const userChatHistory = await getSearchedHistory(id);
    return userChatHistory;
  }),
  addUser: protectedProcedure
    .input(
      z.object({
        main_user_id: z.string(),
        user_id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { main_user_id, user_id } = input;
      await addUserToChatHistory({ main_user_id, user_id });
    }),
  removeUser: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
    await deleteSearchChat(input);
  }),
  clearChatHistory: protectedProcedure.input(z.string()).mutation(async ({ input: id }) => {
    await deleteAllSearchedChats(id);
  }),
});
