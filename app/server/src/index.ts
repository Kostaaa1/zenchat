import express from "express";
import http from "http";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter, postsCaller } from "./routers";
import { initSocket } from "./config/initSocket";
import { Server } from "socket.io";
import "dotenv/config";
import { uploadMessageImage, uploadAvatar, uploadPost, uploadToS3 } from "./middleware/multer";
import { createContext } from "./context";
import { decodeAndVerifyToken } from "./utils/jwt/decodeAndVerifyToken";
import { t } from "./trpc";

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
    const { data } = req.body as { data: string; s3FolderName: string };
    const uploaded = postsCaller({ req, res, session: null }).upload({ data });

    // const { data,  } = req.body as { data: any };
    // const deserialized = JSON.parse(data);
    // await appRouter.posts.upload();
    // console.log(req, res);
    // res.status(200).send("Skrt");
  }
);

app.post(
  "/api/image-upload/post",
  decodeAndVerifyToken,
  uploadPost.array("images"),
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
