import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import "dotenv/config";

const {
  AWS_REGION,
  AWS_ACCESS_KEY_ID = "",
  AWS_SECRET_ACCESS_KEY = "",
  AWS_S3_BUCKETNAME = "",
} = process.env;

const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

export const deleteImageFromS3 = async (fileName: string) => {
  try {
    const params = {
      Bucket: AWS_S3_BUCKETNAME,
      Key: fileName,
    };
    const deleteCommand = new DeleteObjectCommand(params);
    await s3.send(deleteCommand);
    console.log("File ${fileName} deleted successfully !");
  } catch (error) {
    console.log(error);
  }
};

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: AWS_S3_BUCKETNAME,
    key: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
});

export default upload;
