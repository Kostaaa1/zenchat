import { z } from "zod";
import { CreateUserSchema, MessageSchema, PostSchema, UserSchema } from "./zodSchemas";

export type TMessage = z.infer<typeof MessageSchema>;
export type TCreateUserInput = z.infer<typeof CreateUserSchema>;
export type TUserData = z.infer<typeof UserSchema>;

type CommonFields = {
  id: string;
  chatroom_id: string;
  created_at: string;
  user_id: string;
};

export type TChatHistory = CommonFields & {
  users: TUserData;
  last_message: string;
};

export type TPopulatedChat = CommonFields & {
  users: { username: string; image_url: string };
  chatrooms: {
    is_group: boolean;
    last_message: string;
    created_at: string;
    admin: string;
  };
};

export type TChatroom = {
  id: string;
  last_message: string;
  chatroom_id: string;
  created_at: string;
  is_group: boolean;
  new_message: string;
  img_urls: string[];
  users: {
    user_id: string;
    username: string;
    image_url: string;
  }[];
};

export type TPost = z.infer<typeof PostSchema>;

export type UploadPostRequest = {
  user_id: string;
  caption: string;
  media_name: string;
  media_url: string;
};
