import supabase from "../../config/supabase";
import { InputPostSchema } from "../../types/zodSchemas";
import { z } from "zod";
import { deleteS3Object } from "../s3";
import { TPost } from "../../types/types";

export const uploadPost = async (uploadData: z.infer<typeof InputPostSchema>) => {
  const { data, error } = await supabase
    .from("posts")
    .insert(uploadData as TPost)
    .select("*");
  return { data: data![0], error };
};

export const deletePost = async (id: string, fileKeys: string[]) => {
  try {
    // console.log("fileKeys", fileKeys);
    // Delete post from database
    const { error: dbError } = await supabase.from("posts").delete().eq("id", id);
    if (dbError) {
      console.error("Error deleting post from database:", dbError);
      return { success: false, error: dbError };
    }
    // Max 2 iterations (thumbnail and video)
    for (const key of fileKeys) {
      await deleteS3Object(key);
    }
    return { success: true };
  } catch (err) {
    console.error("Unexpected error:", err);
    // @ts-expect-error
    return { success: false, error: err.message || err };
  }
};
