import { TPost } from "../types/types";
import { s3KeyConstructor, uploadToS3 } from "../utils/s3";
import { s3Buckets } from "../config/config";
import { sharpify } from "../utils/utils";

export default {
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
  },
};
