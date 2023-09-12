import { t } from "../trpc";
import { chatRouter } from "./chat/chatroom";
import { userRouter } from "./user";

export const appRouter = t.router({
  user: userRouter,
  chat: chatRouter,
});
