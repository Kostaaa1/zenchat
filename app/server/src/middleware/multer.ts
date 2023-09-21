import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";

const s3 = new S3Client({
  region: "eu-central-1",
  credentials: {
    accessKeyId: "AKIAZ2D72R4435V5KXMI",
    secretAccessKey: "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",
  },
});
const bucketName = "zenchat-images";

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName,
    key: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
});

export default upload;
