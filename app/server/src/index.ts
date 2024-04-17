import express from "express";
import http from "http";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter, trpcCaller } from "./routers";
import { initSocket } from "./config/initSocket";
import { Server } from "socket.io";
import "dotenv/config";
import { uploadMessageImage, uploadAvatar, uploadToS3 } from "./middleware/multer";
import { createContext } from "./context";
import { decodeAndVerifyToken } from "./utils/jwt/decodeAndVerifyToken";

const { CLIENT_URL, IMAGEKIT_URL_ENDPOINT = "" } = process.env;

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

app.post(
  "/api/imageUpload",
  decodeAndVerifyToken,
  uploadToS3.array("images"),
  async (req, res) => {
    if (!req.files) return;
    const { data, s3FolderName } = req.body as { data: string; s3FolderName: string };

    const length = req.files.length as number;
    for (let i = 0; i < length; i++) {
      // @ts-ignore
      const file = req.files[i] as Express.Multer.File;

      const deserialized: {
        user_id: string;
        caption: string;
        media_name: string;
        media_url: string;
      } = JSON.parse(data);

      deserialized["media_name"] = file.originalname;
      deserialized["media_url"] = IMAGEKIT_URL_ENDPOINT + file.originalname;
      await trpcCaller({ req, res, session: null }).posts.upload(deserialized);
    }
  }
);

app.post(
  "/api/image-upload/avatar",
  decodeAndVerifyToken,
  uploadAvatar.array("images"),
  (req, res) => {
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
  }
);

app.post(
  "/api/image-upload/message",
  decodeAndVerifyToken,
  uploadMessageImage.array("images"),
  (req, res) => {
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
  }
);

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export type AppRouter = typeof appRouter;
