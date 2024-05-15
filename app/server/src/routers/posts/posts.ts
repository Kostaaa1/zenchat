import { protectedProcedure, t } from "../../trpc";
import { InputPostSchema } from "../../types/zodSchemas";
import { z } from "zod";
import { deletePost, uploadPost } from "../../utils/supabase/posts";

export const postRouter = t.router({
  upload: protectedProcedure.input(InputPostSchema).mutation(async ({ input }) => {
    try {
      if (!input) return;
      const { data, error } = await uploadPost(input);
      if (error) throw new Error("Error");
      return data;
    } catch (error) {
      throw new Error(`Error while uploading: ${error}`);
    }
  }),
  delete: protectedProcedure
    .input(z.object({ id: z.string(), fileKeys: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      try {
        const { id, fileKeys } = input;
        const err = await deletePost(id, fileKeys);
        if (err) console.log("HANDLE: error deleting the post");
      } catch (err) {
        console.log(err);
      }
    }),
});
