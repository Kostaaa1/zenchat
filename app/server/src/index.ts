import express from "express";
import http from "http";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { initSocket } from "./config/initSocket";
import { Server } from "socket.io";
import "dotenv/config";
import { uploadMessageImage, uploadAvatar } from "./middleware/multer";
import { createContext } from "./context";
import { decodeAndVerifyToken } from "./utils/jwt/decodeAndVerifyToken";

const { CLIENT_URL } = process.env;

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Init Socket:
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
  },
});
initSocket(io);

// app.get("/api/verifyToken", decodeAndVerifyToken, (req: any, res: any, next: any) => {
//   res.status(200).send({ hello: "World" });
// });

// Routes
app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext: createContext,
  })
);

app.post("/api/image-upload/avatar", uploadAvatar.array("images"), (req, res) => {
  res.send({
    urls: (req.files as Express.Multer.File[]).map((file) => {
      const { originalname, size, mimetype } = file;
      return {
        key: originalname,
        type: mimetype,
        size,
      };
    }),
  });
});

app.post("/api/image-upload/message", uploadMessageImage.array("images"), (req, res) => {
  res.send({
    urls: (req.files as Express.Multer.File[]).map((file) => {
      const { originalname, size, mimetype } = file;
      return {
        key: originalname,
        type: mimetype,
        size,
      };
    }),
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export type AppRouter = typeof appRouter;
