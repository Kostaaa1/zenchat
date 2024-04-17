import supabase from "../../config/supabase";
import { InputPostSchema, PostSchema } from "../../types/zodSchemas";
import { z } from "zod";

export const uploadPhoto = async (
  uploadData: z.infer<typeof InputPostSchema>
): Promise<z.infer<typeof PostSchema>> => {
  const { data, error } = await supabase.from("posts").insert(uploadData).select("*");
  if (error || data.length === 0) throw new Error(`Error while inserting a post: ${error}`);
  return data[0];
};
