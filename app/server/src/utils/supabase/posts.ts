import supabase from "../../config/supabase";
import { Tables } from "../../types/supabase";
import { InputPostSchema } from "../../types/zodSchemas";
import { z } from "zod";

export const uploadPost = async (
  uploadData: z.infer<typeof InputPostSchema>
): Promise<Tables<"posts">> => {
  const { data, error } = await supabase.from("posts").insert(uploadData).select("*");
  if (error || data.length === 0) throw new Error(`Error while inserting a post: ${error}`);
  return data[0];
};

export const deletePost = async (id: string): Promise<void> => {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw new Error(`Error while deletin post ${error}`);
};
