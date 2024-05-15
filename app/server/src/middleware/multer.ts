import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import "dotenv/config";
import { BucketFolders } from "../types/types";

const {
  AWS_REGION = "",
  AWS_ACCESS_KEY_ID = "",
  AWS_SECRET_ACCESS_KEY = "",
  AWS_S3_BUCKETNAME = "",
  AWS_BUCKET_URL = "",
} = process.env;

const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

export const deleteS3Object = async ({
  folder,
  fileName,
}: {
  folder: BucketFolders;
  fileName: string;
}) => {
  try {
    const nameForDelete = fileName.startsWith(AWS_BUCKET_URL)
      ? fileName.split(AWS_BUCKET_URL)[1]
      : fileName;

    const params = {
      Bucket: AWS_S3_BUCKETNAME,
      Key: `${folder}/${nameForDelete}`,
    };

    const deleteCommand = new DeleteObjectCommand(params);
    await s3.send(deleteCommand);
    console.log(`File ${fileName} deleted successfully!`);
  } catch (error) {
    console.log(`Error while deleting the file ${fileName}`, error);
    return error;
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
      const folderName: BucketFolders =
        file.mimetype.startsWith("image/") && file.originalname.startsWith("thumbnail-")
          ? "thumbnails"
          : "posts";

      console.log("Folder", folderName, "File: ", file);
      const fullPath = `${folderName}/` + file.originalname;
      cb(null, fullPath);
    },
  }),
});

export { uploadAvatar, uploadMessageImage, multerUploadPost };
