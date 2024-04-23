import express from "express";
import { uploadAvatar, uploadMessageImage, uploadPostImage } from "../middleware/multer";
import { UploadPostRequest } from "../types/types";
import { trpcCaller } from ".";
const uploadRouter = express.Router();

const { IMAGEKIT_URL_ENDPOINT = "" } = process.env;

uploadRouter.post("/post", uploadPostImage.array("uploadPost"), async (req, res) => {
  if (!req.files) return;
  const { serialized } = req.body as {
    serialized: string;
  };
  // @ts-expect-error idk
  const file = req.files[0] as Express.Multer.File;

  const deserialized: UploadPostRequest = JSON.parse(serialized);
  deserialized["media_name"] = file.originalname;
  deserialized["media_url"] = IMAGEKIT_URL_ENDPOINT + file.originalname;

  const uploadedData = await trpcCaller({ req, res, session: null }).posts.upload(deserialized);
  res.status(200).json(uploadedData);
});

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

export default uploadRouter;
