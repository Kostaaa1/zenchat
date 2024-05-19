import { uploadAvatar, uploadMessageImage, multerUploadPost } from "../middleware/multer";
import express from "express";
import { trpcCaller } from ".";
import { env } from "../config/config";
import { s3KeyConstructor } from "../utils/s3";
const uploadRouter = express.Router();

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

uploadRouter.post("/post/image", multerUploadPost.single("post"), async (req, res) => {
  const { file } = req;
  if (!file) return;
  const { serialized } = req.body;

  const { originalname } = file;
  const deserialized = JSON.parse(serialized);
  const fileName = s3KeyConstructor({ folder: "posts", name: originalname });
  deserialized["media_url"] = fileName;

  // Add sharp for images
  const uploadedData = await trpcCaller({ req, res, session: null }).posts.upload(deserialized);
  res.status(200).json(uploadedData);
});

uploadRouter.post("/post/video", multerUploadPost.array("post"), async (req, res) => {
  if (!req.files || !req.body) return;
  const files = req.files as Express.Multer.File[];
  const { serialized } = req.body;

  const { originalname, mimetype } = files[0] as Express.Multer.File;
  const deserialized = JSON.parse(serialized);
  const fileName = s3KeyConstructor({ folder: "posts", name: originalname });
  deserialized["media_url"] = fileName;

  if (mimetype.startsWith("video/") && files[1].originalname.startsWith("thumbnail-")) {
    try {
      const thumbnail_url = s3KeyConstructor({
        folder: "thumbnails",
        name: files[1].originalname,
      });
      deserialized["thumbnail_url"] = thumbnail_url;
    } catch (error) {
      console.log("Error while generating video thumbnail", error);
    }
  }

  const uploadedData = await trpcCaller({ req, res, session: null }).posts.upload(deserialized);
  res.status(200).json(uploadedData);
});

export default uploadRouter;
