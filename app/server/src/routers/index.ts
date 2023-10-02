import { t } from "../trpc";
import { chatRouter } from "./chat/chatroom";
import { userRouter } from "./user";

console.log(process.env.SUPABASE_API_KEY);

export const appRouter = t.router({
  user: userRouter,
  chat: chatRouter,
});
