import { protectedProcedure, t } from "../../trpc";
import { uploadPost, deletePost } from "../../utils/supabase/posts";
import { InputPostSchema } from "../../types/zodSchemas";
import { z } from "zod";

export const postRouter = t.router({
  upload: protectedProcedure.input(InputPostSchema).query(async ({ input }) => {
    try {
      if (!input) return;
      const data = await uploadPost(input);
      return data;
    } catch (error) {
      throw new Error(`Error while uploading: ${error}`);
    }
  }),
  delete: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
    try {
      const yo = await deletePost(input);
    } catch (err) {
      console.log(err);
    }
  }),
});
