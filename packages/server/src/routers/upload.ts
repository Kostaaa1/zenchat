import express from "express";
import type { Response, Request } from "express";
import { trpcCaller } from ".";
import { TPost } from "../types/types";
import multer from "multer";
const uploadRouter = express.Router();
import uploadController from "../controllers/upload";

const upload = multer();

const uploadPost = async (req: Request, res: Response, fileType: string) => {
  const { file, files, body } = req;
  console.log("Upload POST ran");
  if (!file && !files) return res.status(400).json({ error: "No file provided" });
  if (!body) return res.status(400).json({ error: "No body provided" });
  const { serialized } = body;
  const deserialized: TPost = JSON.parse(serialized);
  if (fileType === "image" && file) {
    await uploadController.post.handleImageUpload(file, deserialized);
  } else if (fileType === "video" && files) {
    const multerFiles = files as Express.Multer.File[];
    await uploadController.post.handleVideoUpload(multerFiles, deserialized);
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
  await uploadPost(req, res, "image");
});
uploadRouter.post("/post/video", upload.array("post"), async (req: Request, res: Response) => {
  await uploadPost(req, res, "video");
});
uploadRouter.post("/avatar", upload.single("images"), uploadController.avatar);
uploadRouter.post("/message", upload.array("images"), uploadController.message);

export default uploadRouter;
