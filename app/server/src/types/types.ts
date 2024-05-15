import { z } from "zod";
import { CreateUserSchema, MessageSchema } from "./zodSchemas";
import supabase from "../config/supabase";
import { Tables } from "./supabase";
import { QueryData } from "@supabase/supabase-js";

export type TMessage = z.infer<typeof MessageSchema>;
export type TCreateUserInput = z.infer<typeof CreateUserSchema>;

const chatHistory = supabase
  .from("searched_users")
  .select("*, users(username, image_url, first_name, last_name)");
export type TChatHistory = QueryData<typeof chatHistory>[0];

const userWithPosts = supabase.from("users").select("*, posts(*)");
export type TUserData = QueryData<typeof userWithPosts>[0];
export type TUserDataState = Omit<TUserData, "posts">;
export type TUserQueryParam = {
  data: string;
  type: "userId" | "email" | "username";
};

const populatedChat = supabase
  .from("chatroom_users")
  .select("*, users(username, image_url), chatrooms(last_message, created_at, is_group, admin)");
export type TPopulatedChat = QueryData<typeof populatedChat>[0];

export type TChatroom = {
  id: string;
  chatroom_id: string;
  last_message: string | null;
  created_at: string;
  is_read: boolean;
  is_group: boolean;
  admin: string;
  users: {
    username: string;
    image_url: string | null;
    user_id: string;
    is_active: boolean;
    is_socket_active: boolean;
  }[];
};

export type TPost = Tables<"posts">;
export type UploadPostRequest = {
  user_id: string;
  caption: string;
  media_name: string;
  media_url: string;
};

export type SupabaseResponse<T> =
  | { success: true; data: T }
  | { success: false; message: string };

export type BucketFolders = "posts" | "messages" | "avatars" | "thumbnails";
