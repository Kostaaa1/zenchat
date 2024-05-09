import supabase from "../../config/supabase";
import { protectedProcedure, t } from "../../trpc";
import { InputPostSchema } from "../../types/zodSchemas";
import { z } from "zod";

export const postRouter = t.router({
  upload: protectedProcedure.input(InputPostSchema).query(async ({ input }) => {
    try {
      if (!input) return;
      const { data, error } = await supabase.from("posts").insert(input).select("*");
      if (error || data.length === 0) throw new Error(`Error while inserting a post: ${error}`);
      return data[0];
    } catch (error) {
      throw new Error(`Error while uploading: ${error}`);
    }
  }),
  delete: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
    try {
      const { error } = await supabase.from("posts").delete().eq("id", input);
      if (error) throw new Error(`Error while deletin post ${error}`);
    } catch (err) {
      console.log(err);
    }
  }),
});
