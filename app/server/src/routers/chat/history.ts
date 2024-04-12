import { z } from "zod";
import { t } from "../../trpc";
import {
  addUserToChatHistory,
  deleteAllSearchedChats,
  deleteSearchChat,
  getSearchedHistory,
} from "../../utils/supabase/chatroom";

export const chatHistoryRouter = t.router({
  getAll: t.procedure.input(z.string()).query(async ({ input: id }) => {
    const userChatHistory = await getSearchedHistory(id);
    return userChatHistory;
  }),
  addUser: t.procedure
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
  removeUser: t.procedure.input(z.string()).mutation(async ({ input }) => {
    await deleteSearchChat(input);
  }),
  clearChatHistory: t.procedure
    .input(z.string())
    .mutation(async ({ input: id }) => {
      await deleteAllSearchedChats(id);
    }),
});
