import { S3Client, DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { BucketFolders, env } from "../config/config";

const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_BUCKETNAME, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_URL } =
  env;

const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

export const s3KeyConstructor = (data: { folder: BucketFolders; name: string }) => {
  const { name, folder } = data;
  return `${AWS_BUCKET_URL}/${folder}/${name}`;
};

export const s3KeyExtractor = (name: string) => {
  if (name.startsWith(AWS_BUCKET_URL)) {
    const p = name.split(`${AWS_BUCKET_URL}/`)[1];
    const id = p.indexOf("/");
    return p.slice(id + 1);
  } else {
    return name;
  }
};

export const deleteS3Object = async (key: string) => {
  let name = key;
  if (key.startsWith(AWS_BUCKET_URL)) {
    name = s3KeyExtractor(name);
  }

  const params = {
    Bucket: AWS_BUCKETNAME,
    Key: name,
  };
  const deleteCommand = new DeleteObjectCommand(params);
  await s3.send(deleteCommand);
};

export const uploadToS3 = async ({
  folder,
  key,
  data,
}: {
  folder: string;
  key: string;
  data: Buffer;
}) => {
  try {
    const params = {
      Bucket: AWS_BUCKETNAME,
      Key: `${folder}/${key}`,
      Body: data,
    };
    const uploadCommand = new PutObjectCommand(params);
    const result = await s3.send(uploadCommand);
    console.log("File uploaded successfully:", result);
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};
