import { z } from "zod";
import { CreateUserSchema, MessageSchema } from "./zodSchemas";
import supabase from "../config/supabase";
import { Tables } from "./supabase";
import { PostgrestError, QueryData } from "@supabase/supabase-js";
import { s3Buckets } from "../config/config";

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
  chatroom_id: string;
  last_message: string | null;
  created_at: string;
  is_group: boolean;
  admin: string;
  users: {
    id: string;
    username: string;
    image_url: string | null;
    user_id: string;
    is_active: boolean;
    is_message_seen: boolean;
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

// export type SupabaseResponse<T> =
// | { success: true; data: T }
// | { success: false; message: string };

export type DbSuccess<T> = { status: "success"; data: T };
export type DbError = { status: "error"; data: PostgrestError };
export type DbResponse<T> = DbError | DbSuccess<T>;

export type S3UploadResponse = {
  key: string;
  type: string;
  size: number;
};

////////////////////////
export type MessagesChannelData = {
  channel: "onMessage";
  data: {
    message: TMessage;
    shouldActivate: boolean;
    user_id: string;
  };
};
export type TReceiveNewSocketMessageType = MessagesChannelData;

////////////////////////
type CallType = "initiated" | "declined" | "accepted" | "hangup" | "mute-remote" | "show-remote";
export type CallParticipant = {
  id: string;
  image_url: string | null | undefined;
  username: string | undefined;
  is_caller: boolean;
};
export type SocketCallPayload = {
  type: CallType;
  chatroomId: string;
  participants: CallParticipant[];
};

export type SocketCallUser = {
  user_id: string;
  is_active: boolean;
  image_url?: string | null | undefined;
  username?: string | undefined;
};

export type SocketMsgSeenPayload = {
  participants: string[];
  chatroomId: string;
};

export type S3BucketType = (typeof s3Buckets)[keyof typeof s3Buckets];
