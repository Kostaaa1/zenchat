import { createUploadthing, type FileRouter } from "uploadthing/express";
import { decodeAndVerifyToken } from "./utils/jwt/decodeAndVerifyToken";
import { InputPostSchema } from "./types/zodSchemas";
import { UTApi } from "uploadthing/server";

const f = createUploadthing();

export const utapi = new UTApi();
export const uploadthingRouter = {
  avatar: f(["image"]).onUploadComplete((data) => console.log("file", data)),
  post: f({
    image: { maxFileSize: "32MB", maxFileCount: 4 },
    video: { maxFileSize: "128MB", maxFileCount: 4 },
  })
    // .input(InputPostSchema)
    .middleware(async ({ req, input }) => {
      // console.log("Middleware", req.headers);
      return { success: "HALOOO" };
    })
    .onUploadComplete(async (data) => {
      console.log("DATADeA", data);
      return { success: "HALOOO" };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadthingRouter;
