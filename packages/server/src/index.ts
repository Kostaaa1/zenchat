import express from "express";
import http from "http";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { initSocket } from "./config/initSocket";
import { createContext } from "./context";
import { decodeAndVerifyToken } from "./utils/jwt/decodeAndVerifyToken";
import uploadRouter from "./routers/upload";
import { env } from "./config/config";
import { Server } from "socket.io";

const { PORT } = env;
const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api/upload", decodeAndVerifyToken, uploadRouter);
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
initSocket(io);
const port = PORT || 8000;
// @ts-ignore
server.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});

export type AppRouter = typeof appRouter;
