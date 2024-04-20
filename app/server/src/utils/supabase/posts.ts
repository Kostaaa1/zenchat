import supabase from "../../config/supabase";
import { InputPostSchema, PostSchema } from "../../types/zodSchemas";
import { z } from "zod";

export const uploadPost = async (
  uploadData: z.infer<typeof InputPostSchema>
): Promise<z.infer<typeof PostSchema>> => {
  const { data, error } = await supabase.from("posts").insert(uploadData).select("*");
  if (error || data.length === 0) throw new Error(`Error while inserting a post: ${error}`);
  return data[0];
};

export const deletePost = async (id: string): Promise<null> => {
  // if (imageUrl && imageUrl.length > 0) {
  //   deleteImageFromS3({ folder: "avatars", file: imageUrl[0].image_url });
  // }

  const { data, error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw new Error(`Error while deletin post ${error}`);
  console.log("data delete", data);
  return null;
};
