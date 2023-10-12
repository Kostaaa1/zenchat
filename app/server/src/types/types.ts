import { z } from "zod";
import { createUserSchema, messageSchema, userSchema } from "./zodSchemas";

export type TMessage = z.infer<typeof messageSchema>;
export type TCreateUserInput = z.infer<typeof createUserSchema>;
export type TUserData = z.infer<typeof userSchema>;

type CommonFields = {
  id: string;
  chatroom_id: string;
  created_at: string;
  user_id: string;
};

export type TChatRoomData = CommonFields & {
  last_message: string;
  image_url: string;
  username: string;
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
  };
};

export type TPopulatedChatResponse = {
  id: string;
  last_message: string;
  chatroom_id: string;
  created_at: string;
  is_group: boolean;
  users: {
    user_id: string;
    username: string;
    image_url: string;
  }[];
};
