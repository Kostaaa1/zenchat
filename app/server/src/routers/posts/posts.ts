import { z } from "zod";
import { protectedProcedure, t } from "../../trpc";
import { createCallerFactory } from "@trpc/server";
import { uploadPhoto } from "../../utils/supabase/posts";
import { InputPostSchema } from "../../types/zodSchemas";

export const postRouter = t.router({
  upload: protectedProcedure.input(InputPostSchema).query(async ({ input }) => {
    try {
      if (!input) return;
      await uploadPhoto(input);
    } catch (error) {
      console.log("error while uploading", error);
    }
  }),
});
