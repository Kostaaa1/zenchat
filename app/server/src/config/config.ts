import dotenv from "dotenv";
dotenv.config();

export type BucketFolders = "posts" | "messages" | "avatars" | "thumbnails";
type ServerEnvVars =
  | "PORT"
  | "SUPABASE_API_URL"
  | "SUPABASE_API_KEY"
  | "AWS_BUCKETNAME"
  | "AWS_REGION"
  | "AWS_ACCESS_KEY_ID"
  | "AWS_SECRET_ACCESS_KEY"
  | "AWS_BUCKET_URL";

const envs: ServerEnvVars[] = [
  "PORT",
  "SUPABASE_API_URL",
  "SUPABASE_API_KEY",
  "AWS_REGION",
  "AWS_ACCESS_KEY_ID",
  "AWS_BUCKET_URL",
  "AWS_BUCKETNAME",
  "AWS_SECRET_ACCESS_KEY",
];

const s3Buckets = {
  AVATARS: "avatars",
  MESSAGES: "messages",
  POSTS: "posts",
  THUMBNAILS: "thumbnails",
};

const processenv = () => {
  const missingVars = envs.filter((x) => !process.env[x]);
  if (missingVars.length > 0) {
    console.error(`Missing required env variables. Please add them to .env file: ${missingVars}`);
    process.exit(1);
  }

  const map = {} as { [key in ServerEnvVars]: string };
  envs.forEach((x) => {
    const e = process.env[x];
    if (e) map[x] = e;
  });
  return map;
};

const env = processenv();
export { env, s3Buckets };
