import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import "dotenv/config";
import { env, s3Buckets } from "../config/config";

const { AWS_BUCKETNAME, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_URL } =
  env;

const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

const uploadAvatar = multer({
  storage: multerS3({
    s3,
    bucket: AWS_BUCKETNAME,
    key: (_, file, cb) => {
      cb(null, `${s3Buckets.AVATARS}/${file.originalname}`);
    },
  }),
});

const uploadMessageImage = multer({
  storage: multerS3({
    s3,
    bucket: AWS_BUCKETNAME,
    key: (_, file, cb) => {
      cb(null, `${s3Buckets.MESSAGES}/${file.originalname}`);
    },
  }),
});

const multerUploadPost = multer({
  storage: multerS3({
    s3,
    bucket: AWS_BUCKETNAME,
    key: (_, file, cb) => {
      const folderName =
        file.mimetype.startsWith("image/") && file.originalname.startsWith("thumbnail-")
          ? s3Buckets.THUMBNAILS
          : s3Buckets.POSTS;
      cb(null, `${folderName}/${file.originalname}`);
    },
  }),
});

export { uploadAvatar, uploadMessageImage, multerUploadPost };
