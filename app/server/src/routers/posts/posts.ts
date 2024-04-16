import { z } from "zod";
import { protectedProcedure, t } from "../../trpc";
import { createCallerFactory } from "@trpc/server";
import { uploadPhoto } from "../../utils/supabase/posts";

export const postRouter = t.router({
  upload: protectedProcedure
    .input(
      z.object({
        // Change input
        data: z.string(),
      })
    )
    .query(async ({ input }) => {
      if (!input) return;
      const deserialized = JSON.parse(input.data) as { userId: string; caption: string };
      await uploadPhoto(deserialized);

      console.log("Fetching user started", deserialized);
    }),
});
