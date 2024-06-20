import supabase from "../../config/supabase";
import { Tables } from "../../types/supabase";
import { deleteS3Object } from "../s3";
import { SupabaseResponse, TCreateUserInput, TUserQueryParam } from "../../types/types";

export const getUser = async ({ data, type }: TUserQueryParam) => {
  if (!data) return null;
  const { data: userData, error } = await supabase
    .from("users")
    .select("*, posts(*)")
    .eq(type, data)
    .order("created_at", { foreignTable: "posts", ascending: false });

  if (error) throw new Error(`Error occurred ${error}`);
  if (!userData || userData.length === 0) return null;

  // const { error: countError, count } = await supabase
  //   .from("chatroom_users")
  //   .select("*", { count: "exact", head: true })
  //   .eq("is_message_seen", false)
  //   .eq("user_id", userData[0].id);
  // if (countError) {
  //   throw new Error(`Error occurred when getting the count of unread messages ${countError}`);
  // }

  const returnData = { ...userData[0] };
  return returnData;
};

export const createUser = async ({ username, email, firstName, lastName }: TCreateUserInput) => {
  const { data, error } = await supabase
    .from("users")
    .insert({
      username,
      email,
      image_url: null,
      first_name: firstName,
      last_name: lastName,
    })
    .select("*, posts(*)");

  if (error) throw new Error(`Error while creating user: ${error.message}`);
  if (!data || data.length === 0) {
    throw new Error("User creation failed");
  }
  console.log("Created new user: ", data);
  return { ...data[0] };
};

export const updateUserAvatar = async ({
  userId,
  image_url,
}: {
  userId: string;
  image_url: string;
}) => {
  const { data: imageUrl } = await supabase.from("users").select("image_url").eq("id", userId);
  if (imageUrl && imageUrl[0].image_url) {
    await deleteS3Object(imageUrl[0].image_url);
  }

  const { data, error } = await supabase
    .from("users")
    .update({ image_url })
    .eq("id", userId)
    .select("image_url");

  if (error) throw new Error(error.message);
  return data[0].image_url;
};

export const updateUserData = async (
  userId: string,
  userData: {
    username?: string | undefined;
    last_name?: string | undefined;
    first_name?: string | undefined;
    image_url?: string | undefined;
  }
): Promise<SupabaseResponse<Tables<"users">>> => {
  const { data, error } = await supabase
    .from("users")
    .update({ ...userData })
    .eq("id", userId)
    .select("*");

  if (error) return { success: false, message: error.message };
  return { success: true, data: data[0] };
};

export const getSeachedUsers = async (username: string, searchValue: string) => {
  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .not("username", "eq", username)
    .ilike("username", `${searchValue}%`);

  if (!users) throw new Error(error.message);
  return users;
};
