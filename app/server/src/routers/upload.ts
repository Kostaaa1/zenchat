// import { uploadAvatar, uploadMessageImage, multerUploadPost } from "../middleware/multer";
import express from "express";
import type { Response, Request } from "express";
import { trpcCaller } from ".";
import { s3KeyConstructor, uploadToS3 } from "../utils/s3";
import { TPost } from "../types/types";
import multer, { memoryStorage } from "multer";
const uploadRouter = express.Router();
import sharp from "sharp";
import { s3Buckets } from "../config/config";

const upload = multer();
type SharpFormat = keyof sharp.FormatEnum | sharp.AvailableFormatInfo;

const sharpifyImage = async (file: Express.Multer.File): Promise<Express.Multer.File> => {
  try {
    const { buffer, mimetype } = file;

    if (mimetype.startsWith("image/")) {
      const format = mimetype.split("/")[1] as SharpFormat;
      const supportedFormats: SharpFormat[] = [
        "jpeg",
        "jpg",
        "webp",
        "png",
        "gif",
        "avif",
        "tiff",
      ];

      if (supportedFormats.includes(format)) {
        file.buffer = await sharp(buffer)
          .resize({ width: 800 })
          .toFormat(format, { quality: 90 })
          .toBuffer();
      }
    }
    return file;
  } catch (error) {
    console.log("error while optimizing the image with sharp");
    return file;
  }
};

const handleImageUpload = async (file: Express.Multer.File, deserialized: TPost) => {
  const transcoded = await sharpifyImage(file);
  const { originalname } = transcoded;
  await uploadToS3({
    key: transcoded.originalname,
    folder: s3Buckets.POSTS,
    data: transcoded.buffer,
  });

  const name = s3KeyConstructor({ folder: "posts", name: originalname });
  deserialized["media_url"] = name;
};

const handleVideoUpload = async (files: Express.Multer.File[], deserialized: TPost) => {
  const videoFile = files.find((x) => x.mimetype.startsWith("video/"));
  const thumbnailFile = files.find((x) => x.mimetype.startsWith("image/"));
  if (videoFile) {
    uploadToS3({
      folder: s3Buckets.POSTS,
      data: videoFile.buffer,
      key: videoFile.originalname,
    });

    const { originalname } = videoFile;
    deserialized["media_url"] = s3KeyConstructor({ folder: "posts", name: originalname });
    if (thumbnailFile) {
      uploadToS3({
        folder: s3Buckets.THUMBNAILS,
        data: thumbnailFile.buffer,
        key: thumbnailFile.originalname,
      });
      deserialized["thumbnail_url"] = s3KeyConstructor({
        folder: "thumbnails",
        name: thumbnailFile.originalname,
      });
    }
  }
};

const handleFileUpload = async (req: Request, res: Response, fileType: string) => {
  const { file, files, body } = req;
  if (!file && !files) return res.status(400).json({ error: "No file provided" });
  if (!body) return res.status(400).json({ error: "No body provided" });

  const { serialized } = body;
  const deserialized: TPost = JSON.parse(serialized);

  if (fileType === "image" && file) {
    await handleImageUpload(file, deserialized);
  } else if (fileType === "video" && files) {
    const multerFiles = files as Express.Multer.File[];
    await handleVideoUpload(multerFiles, deserialized);
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
    const file = await sharpifyImage(req.file as Express.Multer.File);
    await uploadToS3({
      folder: s3Buckets.AVATARS,
      key: file.originalname,
      data: file.buffer,
    });
    const { originalname, size, mimetype } = file;
    res.status(200).send({ urls: { key: originalname, type: mimetype, size: size } });
  } catch (error) {
    console.log("errorr", error);
    res.status(500).send(`Uploading avatar to S3 failed: ${error}`);
  }
});

uploadRouter.post("/message", upload.array("images"), (req, res) => {
  try {
    res.status(200).send({
      urls: (req.files as Express.Multer.File[]).map(async (file) => {
        file = await sharpifyImage(file);
        await uploadToS3({
          folder: s3Buckets.MESSAGES,
          key: file.originalname,
          data: file.buffer,
        });
        const { originalname, size, mimetype } = file;
        return {
          key: originalname,
          type: mimetype,
          size,
        };
      }),
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).send(`Sending message failed. Error: ${error}`);
  }
});

export default uploadRouter;
