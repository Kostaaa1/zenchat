import supabase from "../../config/supabase";

export const uploadPhoto = async (uploadData: {
  userId: string;
  caption: string;
}): Promise<any> => {
  const { data, error } = await supabase.from("posts").insert(uploadData);
  if (error || !data) throw new Error(`Error while inserting a post: ${error}`);
  console.log("INSERTED DATA ", data);
  return data;
};
