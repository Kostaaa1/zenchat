import { z } from "zod";
import { protectedProcedure, t } from "../trpc";
import {
  createUser,
  getSeachedUsers,
  getUser,
  updateUserAvatar,
  updateUserData,
} from "../utils/supabase/user";
import { createUserSchema } from "../types/zodSchemas";
import { TRPCError, initTRPC } from "@trpc/server";

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
      console.log("Fetching user started", input);

      const userData = await getUser(input);
      console.log("Return user data", userData);
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
    .mutation(async ({ input, ctx }) => {
      const req = await updateUserAvatar(input);

      if (req.error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Updating Avatar Failed!",
        });
      }

      return req.data;
    }),
  updateUserData: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        userData: z.object({
          username: z.string().nullish(),
          last_name: z.string().nullish(),
          first_name: z.string().nullish(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const { userData, userId } = input;
      await updateUserData(userId, userData);
      return true;
    }),
  create: protectedProcedure.input(createUserSchema).mutation(async ({ input }) => {
    try {
      const { email, firstName, lastName, username } = input;
      console.log(email, firstName, lastName, username);

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
