import express from "express";
import type { Response, Request } from "express";
import { trpcCaller } from ".";
import { uploadToS3 } from "../utils/s3";
import { TPost } from "../types/types";
import multer from "multer";
const uploadRouter = express.Router();
import { s3Buckets } from "../config/config";
import uplodController from "../controllers/upload";
import { sharpify } from "../utils/utils";
// import { uploadAvatar, uploadMessageImage, multerUploadPost } from "../middleware/multer";

const upload = multer();

const handleFileUpload = async (req: Request, res: Response, fileType: string) => {
  const { file, files, body } = req;
  if (!file && !files) return res.status(400).json({ error: "No file provided" });
  if (!body) return res.status(400).json({ error: "No body provided" });

  const { serialized } = body;
  const deserialized: TPost = JSON.parse(serialized);

  if (fileType === "image" && file) {
    await uplodController.handleImageUpload(file, deserialized);
  } else if (fileType === "video" && files) {
    const multerFiles = files as Express.Multer.File[];
    await uplodController.handleVideoUpload(multerFiles, deserialized);
  }

  try {
    const uploadedData = await trpcCaller({ req, res, session: null }).posts.upload(deserialized);
    return res.status(200).json(uploadedData);
  } catch (error) {
    console.error("Error during POSTs file upload.", error);
    return res.status(500).json({ error: "Uploading POST failed." });
  }
};

uploadRouter.post("/post/image", upload.single("post"), async (req: Request, res: Response) => {
  await handleFileUpload(req, res, "image");
});

uploadRouter.post("/post/video", upload.array("post"), async (req: Request, res: Response) => {
  await handleFileUpload(req, res, "video");
});

uploadRouter.post("/avatar", upload.single("images"), async (req, res) => {
  try {
    const file = await sharpify(req.file as Express.Multer.File);
    await uploadToS3({
      folder: s3Buckets.AVATARS,
      key: file.originalname,
      data: file.buffer,
    });
    const { originalname, size, mimetype } = file;
    res.status(200).send({ key: originalname, type: mimetype, size: size });
  } catch (error) {
    console.log("errorr", error);
    res.status(500).send(`Uploading avatar to S3 failed: ${error}`);
  }
});

uploadRouter.post("/message", upload.array("images"), async (req, res) => {
  try {
    console.log("REQ FILES", req.files);
    const files = (req.files as Express.Multer.File[]).map(async (file) => {
      const sharpified = await sharpify(file);
      const { buffer, originalname, mimetype, size } = sharpified;
      await uploadToS3({
        folder: s3Buckets.MESSAGES,
        key: originalname,
        data: buffer,
      });

      return {
        key: originalname,
        type: mimetype,
        size,
      };
    });

    const data = await Promise.all(files);
    console.log("Urls", data);
    res.status(200).send({ urls: data });
  } catch (error) {
    console.log("Error", error);
    res.status(500).send(`Sending message failed. Error: ${error}`);
  }
});

export default uploadRouter;
