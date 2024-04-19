import { protectedProcedure, t } from "../../trpc";
import { uploadPhoto } from "../../utils/supabase/posts";
import { InputPostSchema } from "../../types/zodSchemas";

export const postRouter = t.router({
  upload: protectedProcedure.input(InputPostSchema).query(async ({ input }) => {
    try {
      if (!input) return;
      const data = await uploadPhoto(input);
      return data;
    } catch (error) {
      throw new Error(`Error while uploading: ${error}`);
    }
  }),
});
