import { TPost } from "../types/types";
import { s3KeyConstructor, uploadToS3 } from "../utils/s3";
import { s3Buckets } from "../config/config";
import { sharpify } from "../utils/utils";
import { Request, Response } from "express";
import { trpcCaller } from "../routers";

export default {
  post: {
    handleImageUpload: async (file: Express.Multer.File, deserialized: TPost) => {
      const transcoded = await sharpify(file);
      const { originalname } = transcoded;
      uploadToS3({
        key: transcoded.originalname,
        folder: s3Buckets.POSTS,
        data: transcoded.buffer,
      });
      const name = s3KeyConstructor({ folder: "posts", name: originalname });
      deserialized["media_url"] = name;
    },
    handleVideoUpload: async (files: Express.Multer.File[], deserialized: TPost) => {
      const videoFile = files.find((x) => x.mimetype.startsWith("video/"));
      const thumbnailFile = files.find((x) => x.mimetype.startsWith("image/"));

      if (videoFile) {
        uploadToS3({
          folder: s3Buckets.POSTS,
          data: videoFile.buffer,
          key: videoFile.originalname,
        });
        const { originalname } = videoFile;
        deserialized.media_url = s3KeyConstructor({ folder: "posts", name: originalname });
        if (thumbnailFile) {
          uploadToS3({
            folder: s3Buckets.THUMBNAILS,
            data: thumbnailFile.buffer,
            key: thumbnailFile.originalname,
          });
          deserialized.thumbnail_url = s3KeyConstructor({
            folder: "thumbnails",
            name: thumbnailFile.originalname,
          });
        }
      }
    },
  },
  avatar: async (req: Request, res: Response) => {
    try {
      const file = await sharpify(req.file as Express.Multer.File);
      // const file = req.file as Express.Multer.File
      await uploadToS3({
        folder: s3Buckets.AVATARS,
        key: file.originalname,
        data: file.buffer,
      });
      const { originalname } = file;
      const { userId } = JSON.parse(req.body.serialized);

      const s3Url = await trpcCaller({ req, res, session: null }).user.updateAvatar({
        image_url: s3KeyConstructor({ folder: "avatars", name: originalname }),
        userId,
      });
      res.status(200).send(s3Url);
    } catch (error) {
      console.log("errorr", error);
      res.status(500).send(`Uploading avatar to S3 failed: ${error}`);
    }
  },
  message: async (req: Request, res: Response) => {
    try {
      const uploadFile = async (file: Express.Multer.File) => {
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
      };

      const files = req.files as Express.Multer.File[];
      const data = await Promise.all(files.map(async (f) => await uploadFile(f)));
      console.log("Urls", data);
      res.status(200).send({ urls: data });
    } catch (error) {
      console.log("Error", error);
      res.status(500).send(`Sending message failed. Error: ${error}`);
    }
  },
};
