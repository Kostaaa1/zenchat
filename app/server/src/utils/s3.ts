import { S3Client, DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
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

export const deleteS3Object = async ({ folder, file }: { folder: string; file: string }) => {
  try {
    const params = {
      Bucket: AWS_S3_BUCKETNAME,
      Key: `${folder}/${file}`,
    };
    const deleteCommand = new DeleteObjectCommand(params);
    await s3.send(deleteCommand);
  } catch (error) {
    console.log(error);
  }
};

export const uploadToS3 = async ({
  folder,
  file,
  data,
}: {
  folder: string;
  file: string;
  data: Buffer;
}) => {
  try {
    const params = {
      Bucket: AWS_S3_BUCKETNAME,
      Key: `${folder}/${file}`,
      Body: data,
    };
    const uploadCommand = new PutObjectCommand(params);
    const result = await s3.send(uploadCommand);
    console.log("File uploaded successfully:", result);
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};
