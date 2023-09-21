import express from "express";
import http from "http";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { initSocket } from "./config/initSocket";
import { Server } from "socket.io";
import "dotenv/config";
import upload from "./middleware/multer";

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

// Routes
app.use("/trpc", createExpressMiddleware({ router: appRouter }));

app.post("/api/upload", upload.array("images"), (req, res) => {
  console.log(req.files);
  res.send({
    message: "Uploaded!",
    urls: (req.files as Express.Multer.File[])?.map((file) => {
      const { originalname, size, mimetype } = file;
      console.log(file);

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
