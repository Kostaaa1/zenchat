import { TRPCError } from "@trpc/server";
import supabase from "../../config/supabase";
import { TCreateUserInput, TUserData } from "../../types/types";
import { deleteImageFromS3 } from "../../middleware/multer";

type UserGetter = {
  data: string;
  type: "userId" | "email" | "username";
};

export const getUser = async ({ data, type }: UserGetter): Promise<TUserData | null> => {
  if (!data) return null;
  const { data: userData, error } = await supabase
    .from("users")
    .select("*, posts(*)")
    .eq(type, data);

  if (error) throw new Error(`Error occured ${error}`);
  return userData && userData.length > 0 ? userData[0] : null;
};

// export const getUserPosts = async ({ data, type }: UserGetter) => {
//   const { data: userData } = await supabase.from("users").select("id").eq(type, data);
//   if (!userData) throw new Error("error while getting the user id in getUsersPosts");
//   console.log("userData", userData);

//   const { data: posts } = await supabase.from("posts").select("*").eq("user_id", userData[0].id);
//   if (!posts) throw new Error("Error while getting the posts");
//   console.log("posts");
//   return posts;
// };

export const updateUserAvatar = async ({
  userId,
  image_url,
}: {
  userId: string;
  image_url: string;
}) => {
  const { data: imageUrl } = await supabase.from("users").select("image_url").eq("id", userId);
  if (imageUrl && imageUrl.length > 0) {
    deleteImageFromS3({ folder: "avatars", file: imageUrl[0].image_url });
  }
  const { data, error } = await supabase
    .from("users")
    .update({ image_url })
    .eq("id", userId)
    .select("image_url");
  if (error) return { error };

  return { data: data[0].image_url };
};

export const updateUserData = async (
  userId: string,
  userData: {
    username?: string | null | undefined;
    last_name?: string | null | undefined;
    first_name?: string | null | undefined;
    image_url?: string | null | undefined;
  }
) => {
  console.log(userId, userData);
  const { data, error } = await supabase
    .from("users")
    .update({ ...userData })
    .eq("id", userId)
    .select("*");

  if (error) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `User Image update Error: ${error}`,
    });
  }

  return data[0];
};

export const getSeachedUsers = async (
  username: string,
  searchValue: string
): Promise<TUserData[]> => {
  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .not("username", "eq", username)
    .ilike("username", `${searchValue}%`);

  if (!users) {
    throw new Error(error.message);
  }

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
    .select("*");

  if (error) {
    throw new Error(`Error while creating user: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error("User creation failed");
  }

  const userData = data[0];
  return userData;
};
