import { createUploadthing, type FileRouter } from "uploadthing/express";
import { UTApi } from "uploadthing/server";

const f = createUploadthing();

export const utapi = new UTApi();
export const uploadthingRouter = {
  avatar: f(["image"]).onUploadComplete((data) => console.log("file", data)),
  post: f({
    image: { maxFileSize: "32MB", maxFileCount: 4 },
    video: { maxFileSize: "128MB", maxFileCount: 4 },
  })
    .middleware(async ({ req, input }) => {
      return { success: "HALOOO", message: "hello" as const };
    })
    .onUploadComplete(async ({ metadata }) => {
      console.log("METADATA", metadata);
    }),
  message: f({
    image: { maxFileSize: "32MB", maxFileCount: 4 },
  })
    .middleware(async ({ req, input }) => {
      return { success: "HALOOO" };
    })
    .onUploadComplete(async (data) => {
      return { success: "HALOOO" };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadthingRouter;
