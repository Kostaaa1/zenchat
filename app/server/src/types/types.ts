import { ZodSchema, z } from "zod";

export const userSchema: ZodSchema<{
  id: string;
  created_at: string;
  username: string;
  email: string;
  image_url: string;
  first_name: string;
  last_name: string;
}> = z.object({
  id: z.string(),
  created_at: z.string(),
  username: z.string(),
  email: z.string(),
  image_url: z.string(),
  first_name: z.string(),
  last_name: z.string(),
});

export const createUserSchema: ZodSchema<{
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
}> = z.object({
  username: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  email: z.string(),
});

export const messageSchema: ZodSchema<{
  sender_id: string;
  chatroom_id: string;
  content: string;
  created_at: string;
}> = z.object({
  sender_id: z.string(),
  chatroom_id: z.string(),
  content: z.string(),
  created_at: z.string(),
});

export type TMessage = z.infer<typeof messageSchema>;

export const chatRoomDataSchema: ZodSchema<
  | {
      id: string;
      chatroom_id: string;
      created_at: string;
      user_id: string;
      last_message: string;
      image_url: string;
      username: string;
      messages: TMessage[];
    }
  | undefined
> = z.object({
  id: z.string(),
  chatroom_id: z.string(),
  created_at: z.string(),
  user_id: z.string(),
  last_message: z.string(),
  image_url: z.string(),
  username: z.string(),
  messages: z.array(messageSchema),
});

export type TCreateUserInput = z.infer<typeof createUserSchema>;
export type TUserData = z.infer<typeof userSchema>;

// export type TMessage = {
//   sender_id: string;
//   chatroom_id: string;
//   content: string;
//   created_at: string;
// };

export type TChatRoomData = {
  id: string;
  chatroom_id: string;
  created_at: string;
  user_id: string;
  last_message: string;
  image_url: string;
  username: string;
  messages: TMessage[];
};

export type TChatHistory = {
  id: string;
  chatroom_id: string;
  created_at: string;
  user_id: string;
  last_message: string;
  users: IUserData;
};

export type IUserData = {
  id: string;
  created_at: string;
  username: string;
  email: string;
  image_url: string;
  first_name: string;
  last_name: string;
};

export type TChat = {
  id?: string;
  created_at?: string;
  last_message: string;
  userId1: number;
  userId2: number;
};

// export interface IUserData {
//   id: string;
//   created_at: string;
//   username: string;
//   email: string;
//   image_url: string;
//   first_name: string;
//   last_name: string;
// }

// export interface IUserData {
//   username: string;
//   image_url: string;
// }

//   interface TMessage {
//     sender_id: string;
//     chatroom_id: string;
//     content: string;
//     created_at: string;
//   }
