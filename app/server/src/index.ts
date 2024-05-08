import express from "express";
import http from "http";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { initSocket } from "./config/initSocket";
import { Server } from "socket.io";
import "dotenv/config";
import { createContext } from "./context";
import { decodeAndVerifyToken } from "./utils/jwt/decodeAndVerifyToken";
import uploadRouter from "./routers/upload";

const { CLIENT_URL } = process.env;

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
  },
});
initSocket(io);

app.use("/api/uploadMedia", decodeAndVerifyToken, uploadRouter);
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export type AppRouter = typeof appRouter;
