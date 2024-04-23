import { ZodSchema, z } from "zod";

export const InputPostSchema = z.object({
  caption: z.string(),
  media_name: z.string(),
  media_url: z.string(),
  user_id: z.string(),
});

export const OutputPostSchema = z.object({
  id: z.string(),
  created_at: z.string(),
});

export const PostSchema = InputPostSchema.merge(OutputPostSchema);

export const UserSchema: ZodSchema<{
  id: string;
  created_at: string;
  username: string;
  email: string;
  image_url: string;
  first_name: string;
  last_name: string;
  description: string;
  posts: z.infer<typeof PostSchema>[];
}> = z.object({
  id: z.string(),
  created_at: z.string(),
  username: z.string(),
  email: z.string(),
  image_url: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  description: z.string(),
  posts: z.array(PostSchema),
});

export const CreateUserSchema: ZodSchema<{
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

export const MessageSchema: ZodSchema<{
  id: string;
  sender_id: string;
  chatroom_id: string;
  content: string;
  created_at: string;
  is_image: boolean;
}> = z.object({
  id: z.string(),
  sender_id: z.string(),
  chatroom_id: z.string(),
  content: z.string(),
  created_at: z.string(),
  is_image: z.boolean(),
});

export const ChatRoomDataSchema: ZodSchema<
  | {
      id: string;
      chatroom_id: string;
      created_at: string;
      user_id: string;
      last_message: string;
      image_url: string;
      username: string;
      messages: z.infer<typeof MessageSchema>[];
      is_group: boolean;
      participants: string[];
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
  messages: z.array(MessageSchema),
  is_group: z.boolean(),
  participants: z.array(z.string()),
});
