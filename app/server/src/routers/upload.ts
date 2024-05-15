import { uploadAvatar, uploadMessageImage, multerUploadPost } from "../middleware/multer";
import express from "express";
import { trpcCaller } from ".";
const uploadRouter = express.Router();

const { AWS_BUCKET_URL = "" } = process.env;

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
  if (!req.files || !req.body) return;
  const files = req.files as Express.Multer.File[];
  const { serialized } = req.body as {
    serialized: string;
  };

  const videoFile = files[0] as Express.Multer.File;
  const deserialized = JSON.parse(serialized);
  const fileName = AWS_BUCKET_URL + "posts/" + videoFile.originalname;
  deserialized["media_url"] = fileName;

  if (videoFile.mimetype.startsWith("video/")) {
    try {
      const thumbnail_url = AWS_BUCKET_URL + "thumbnails/" + files[1].originalname;
      console.log("thumbnail_url", thumbnail_url);
      deserialized["thumbnail_url"] = thumbnail_url;
    } catch (error) {
      console.log("Error while generating video thumbnail", error);
    }
  }

  const uploadedData = await trpcCaller({ req, res, session: null }).posts.upload(deserialized);
  res.status(200).json(uploadedData);
});

export default uploadRouter;
