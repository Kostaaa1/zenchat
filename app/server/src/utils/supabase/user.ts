import supabase from "../../config/supabase";
import { TCreateUserInput, TUserData } from "../../types/types";

export const getUser = async ({
  data,
  type,
}: {
  data: string;
  type: "userId" | "email" | "username";
}): Promise<TUserData | null> => {
  if (!data) return null;

  const { data: userData, error } = await supabase
    .from("users")
    .select("*")
    .eq(type, data);

  if (error) {
    console.log(error);
  }

  return userData && userData.length > 0 ? userData[0] : null;
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
