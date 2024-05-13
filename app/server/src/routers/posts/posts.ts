import { protectedProcedure, t } from "../../trpc";
import { InputPostSchema } from "../../types/zodSchemas";
import { z } from "zod";
import { deletePost, uploadPost } from "../../utils/supabase/posts";

export const postRouter = t.router({
  upload: protectedProcedure.input(InputPostSchema).query(async ({ input }) => {
    try {
      if (!input) return;
      const { data, error } = await uploadPost(input);
      if (error) throw new Error("Error");
      return data;
    } catch (error) {
      throw new Error(`Error while uploading: ${error}`);
    }
  }),
  get: protectedProcedure.input(z.string()).query(async ({ input }) => {
    console.log("Post Id", input);
  }),
  delete: protectedProcedure
    .input(z.object({ id: z.string(), s3FileName: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const { id, s3FileName } = input;
        const err = await deletePost(id, s3FileName);
        if (err) console.log("HANDLE: error deleting the post");
      } catch (err) {
        console.log(err);
      }
    }),
});
