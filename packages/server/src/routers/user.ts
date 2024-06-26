import { z } from "zod";
import { protectedProcedure, t } from "../trpc";
import {
  createUser,
  getSeachedUsers,
  getUser,
  updateUserAvatar,
  updateUserData,
} from "../utils/supabase/user";
import { CreateUserSchema } from "../types/zodSchemas";
import { TRPCError } from "@trpc/server";

export const userRouter = t.router({
  get: protectedProcedure
    .input(
      z.object({
        data: z.string(),
        type: z.literal("userId").or(z.literal("email")).or(z.literal("username")),
      })
    )
    .query(async ({ input }) => {
      if (!input) return;
      let userData = await getUser(input);
      return userData;
    }),
  search: protectedProcedure
    .input(z.object({ username: z.string(), searchValue: z.string() }))
    .query(async ({ input }) => {
      const { searchValue, username } = input;
      const searchedUsers = await getSeachedUsers(username, searchValue);
      return searchedUsers;
    }),
  updateAvatar: protectedProcedure
    .input(z.object({ userId: z.string(), image_url: z.string() }))
    .mutation(async ({ input }) => {
      const req = await updateUserAvatar(input);
      return req;
    }),
  updateUserData: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        userData: z.object({
          username: z.string().optional(),
          last_name: z.string().optional(),
          first_name: z.string().optional(),
          description: z.string().optional(),
          image_url: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const { userData, userId } = input;
      const { data, status } = await updateUserData(userId, userData);
      if (status === "error") {
        throw new TRPCError({ code: "UNPROCESSABLE_CONTENT", message: data.message });
      }
      return data;
    }),
  create: protectedProcedure.input(CreateUserSchema).mutation(async ({ input }) => {
    try {
      const { email, firstName, lastName, username } = input;
      const userData = await createUser({
        email,
        firstName,
        lastName,
        username,
      });

      return userData;
    } catch (error) {
      console.log(error);
    }
  }),
});
