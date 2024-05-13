import {
  uploadAvatar,
  uploadMessageImage,
  multerUploadPost,
  // uploadPostImage,
  // uploadPostVideo,
} from "../middleware/multer";
import express from "express";
import { trpcCaller } from ".";
const uploadRouter = express.Router();
import { TPost } from "../types/types";

const { IMAGEKIT_URL_ENDPOINT = "" } = process.env;

uploadRouter.post("/avatar", uploadAvatar.array("images"), (req, res) => {
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

uploadRouter.post("/message", uploadMessageImage.array("images"), (req, res) => {
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

uploadRouter.post("/post", multerUploadPost.array("post"), async (req, res) => {
  if (!req.files) return;
  const { serialized } = req.body as {
    serialized: string;
  };
  // @ts-expect-error idk
  const file = req.files[0] as Express.Multer.File;
  const deserialized = JSON.parse(serialized);
  deserialized["media_name"] = file.originalname;
  deserialized["media_url"] = IMAGEKIT_URL_ENDPOINT + file.originalname;

  const uploadedData = await trpcCaller({ req, res, session: null }).posts.upload(deserialized);
  res.status(200).json(uploadedData);
});

export default uploadRouter;
