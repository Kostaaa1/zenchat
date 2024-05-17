// import { decodeAndVerifyToken } from "./utils/jwt/decodeAndVerifyToken";
// import uploadRouter from "./routers/upload";
import express from "express";
import http from "http";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { initSocket } from "./config/initSocket";
import { Server } from "socket.io";
import { createContext } from "./context";
import { createRouteHandler } from "uploadthing/express";
import { uploadthingRouter } from "../src/uploadthing";
import env from "./config/config";
import { decodeAndVerifyToken } from "./utils/jwt/decodeAndVerifyToken";

const { CLIENT_URL, PORT } = env;
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

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.use(
  "/api/uploadthing",
  decodeAndVerifyToken,
  createRouteHandler({
    router: uploadthingRouter,
    config: {
      logLevel: "debug",
    },
  })
);

const port = PORT || 8000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export type AppRouter = typeof appRouter;
