import supabase from "../../config/supabase";
import { deleteS3Object } from "../../middleware/multer";
import { Tables } from "../../types/supabase";
import {
  SupabaseResponse,
  TCreateUserInput,
  TUserData,
  TUserQueryParam,
} from "../../types/types";

export const getUser = async ({ data, type }: TUserQueryParam) => {
  if (!data) return null;
  const { data: userData, error } = await supabase
    .from("users")
    .select("*, posts(*)")
    .eq(type, data)
    .order("created_at", { foreignTable: "posts", ascending: false });

  if (error) throw new Error(`Error occured ${error}`);
  return userData[0] || null;
};

export const updateUserAvatar = async ({
  userId,
  image_url,
}: {
  userId: string;
  image_url: string;
}) => {
  const { data: imageUrl } = await supabase.from("users").select("image_url").eq("id", userId);
  if (imageUrl?.[0]!.image_url) {
    await deleteS3Object({ folder: "avatars", fileName: imageUrl[0].image_url });
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
  console.log("To update: ", userId, "Data: ", userData);
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

export const createUser = async ({
  username,
  email,
  firstName,
  lastName,
}: TCreateUserInput): Promise<TUserData> => {
  const { data, error } = await supabase
    .from("users")
    .insert({
      username,
      email,
      image_url: "",
      first_name: firstName,
      last_name: lastName,
    })
    .select("*, posts(*)");

  if (error) throw new Error(`Error while creating user: ${error.message}`);
  if (!data || data.length === 0) {
    throw new Error("User creation failed");
  }

  console.log("Created new user: ", data);
  return data[0];
};
