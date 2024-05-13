import supabase from "../../config/supabase";
import { InputPostSchema } from "../../types/zodSchemas";
import { z } from "zod";

export const uploadPost = async (uploadData: z.infer<typeof InputPostSchema>) => {
  const { data, error } = await supabase.from("posts").insert(uploadData).select("*");
  return { data: data![0], error };
};

export const deletePost = async (id: string, media_name: string) => {
  try {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    // await deleteS3Object({
    //   folder: "post",
    //   file: img.content.split("")[1],
    // });
    return error;
  } catch (err) {
    console.log(err);
  }
};
