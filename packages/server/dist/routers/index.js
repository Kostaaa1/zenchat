"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trpcCaller = exports.appRouter = void 0;
const trpc_1 = require("../trpc");
const chatroom_1 = require("./chat/chatroom");
const posts_1 = require("./posts/posts");
const user_1 = require("./user");
exports.appRouter = trpc_1.t.router({
    user: user_1.userRouter,
    chat: chatroom_1.chatRouter,
    posts: posts_1.postRouter,
});
exports.trpcCaller = trpc_1.t.createCallerFactory(exports.appRouter);
//# sourceMappingURL=index.js.map