import supabase from "../../config/supabase";
import { InputPostSchema } from "../../types/zodSchemas";
import { z } from "zod";
import env from "../../config/config";

// const { UPLOADTHING_URL_PREFIX } = env;

export const uploadPost = async (uploadData: z.infer<typeof InputPostSchema>) => {
  const { data, error } = await supabase.from("posts").insert(uploadData).select("*");
  return { data: data![0], error };
};

export const deletePost = async (id: string, fileKeys: string[]) => {
  try {
    // Delete post from database
    const { error: dbError } = await supabase.from("posts").delete().eq("id", id);
    if (dbError) {
      console.error("Error deleting post from database:", dbError);
      return { success: false, error: dbError };
    }

    // Deleting upladed files
    // await utapi.deleteFiles(fileKeys.map((x) => x.split(UPLOADTHING_URL_PREFIX)[1]));

    return { success: true };
  } catch (err) {
    console.error("Unexpected error:", err);
    // @ts-expect-error
    return { success: false, error: err.message || err };
  }
};
