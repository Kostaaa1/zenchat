import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import "dotenv/config";

const {
  AWS_REGION,
  AWS_ACCESS_KEY_ID = "",
  AWS_SECRET_ACCESS_KEY = "",
  AWS_S3_BUCKETNAME = "",
  IMAGEKIT_URL_ENDPOINT,
} = process.env;

const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

export const deleteS3Object = async ({ folder, file }: { folder: string; file: string }) => {
  try {
    const removePrefixer = file.split(IMAGEKIT_URL_ENDPOINT as string);
    console.log(`Deleting file ${removePrefixer} from S3:`);

    const params = {
      Bucket: AWS_S3_BUCKETNAME,
      Key: `${folder}/${removePrefixer.length > 1 ? removePrefixer[1] : file}`,
    };

    const deleteCommand = new DeleteObjectCommand(params);
    await s3.send(deleteCommand);
    console.log(`File ${file} deleted successfully !`);
  } catch (error) {
    console.log(error);
  }
};

const uploadAvatar = multer({
  storage: multerS3({
    s3,
    bucket: AWS_S3_BUCKETNAME,
    key: (_, file, cb) => {
      const fullPath = "avatars/" + file.originalname;
      cb(null, fullPath);
    },
  }),
});

const uploadMessageImage = multer({
  storage: multerS3({
    s3,
    bucket: AWS_S3_BUCKETNAME,
    key: (_, file, cb) => {
      const fullPath = "messages/" + file.originalname;
      cb(null, fullPath);
    },
  }),
});

const multerUploadPost = multer({
  storage: multerS3({
    s3,
    bucket: AWS_S3_BUCKETNAME,
    key: (_, file, cb) => {
      const fullPath = "posts/" + file.originalname;
      cb(null, fullPath);
    },
  }),
});

export { uploadAvatar, uploadMessageImage, multerUploadPost };
