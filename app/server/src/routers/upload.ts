import { uploadAvatar, uploadMessageImage, multerUploadPost } from "../middleware/multer";
import express from "express";
import type { Response, Request } from "express";
import { trpcCaller } from ".";
import { s3KeyConstructor } from "../utils/s3";
import { TPost } from "../types/types";
const uploadRouter = express.Router();

const handleFileUpload = async (req: Request, res: Response, fileType: string) => {
  const { file, files, body } = req;
  if (!file && !files) return res.status(400).json({ error: "No file provided" });
  if (!body) return res.status(400).json({ error: "No body provided" });

  const { serialized } = body;
  const deserialized: TPost = JSON.parse(serialized);

  if (fileType === "image" && file) {
    const { originalname } = file;
    const name = s3KeyConstructor({ folder: "posts", name: originalname });
    deserialized["media_url"] = name;
  } else if (fileType === "video") {
    const multerFiles = files as Express.Multer.File[];
    const videoFile = multerFiles.find((x) => x.mimetype.startsWith("video/"));
    const thumbnailFile = multerFiles.find((x) => x.mimetype.startsWith("image/"));

    if (videoFile) {
      const { originalname } = videoFile;
      deserialized["media_url"] = s3KeyConstructor({ folder: "posts", name: originalname });
      if (thumbnailFile) {
        deserialized["thumbnail_url"] = s3KeyConstructor({
          folder: "thumbnails",
          name: thumbnailFile.originalname,
        });
      }
    }
  }

  try {
    const uploadedData = await trpcCaller({ req, res, session: null }).posts.upload(deserialized);
    return res.status(200).json(uploadedData);
  } catch (error) {
    console.error("Error during POSTs file upload.", error);
    return res.status(500).json({ error: "Uploading POST failed." });
  }
};

uploadRouter.post(
  "/post/video",
  multerUploadPost.array("post"),
  async (req: Request, res: Response) => {
    await handleFileUpload(req, res, "video");
  }
);

uploadRouter.post(
  "/post/image",
  multerUploadPost.single("post"),
  async (req: Request, res: Response) => {
    await handleFileUpload(req, res, "image");
  }
);

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
  console.log("Messageroutecalled");
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
