import { t } from "../trpc";
import { chatRouter } from "./chat/chatroom";
import { postRouter } from "./posts/posts";
import { userRouter } from "./user";

export const appRouter = t.router({
  user: userRouter,
  chat: chatRouter,
  posts: postRouter,
});

export const trpcCaller = t.createCallerFactory(appRouter);
