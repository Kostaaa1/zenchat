import { ZodSchema, string, z } from "zod";

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
  id: string;
  sender_id: string;
  chatroom_id: string;
  content: string;
  created_at: string;
  isImage: boolean;
}> = z.object({
  id: z.string(),
  sender_id: z.string(),
  chatroom_id: z.string(),
  content: z.string(),
  created_at: z.string(),
  isImage: z.boolean(),
});

export const chatRoomDataSchema: ZodSchema<
  | {
      id: string;
      chatroom_id: string;
      created_at: string;
      user_id: string;
      last_message: string;
      image_url: string;
      username: string;
      messages: z.infer<typeof messageSchema>[];
      is_group: boolean;
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
  is_group: z.boolean(),
});
