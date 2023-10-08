import { z } from "zod";
import { t } from "../trpc";
import { createUser, getSeachedUsers, getUser } from "../utils/supabase/user";
import { createUserSchema } from "../types/zodSchemas";

export const userRouter = t.router({
  get: t.procedure
    .input(
      z.object({
        data: z.string(),
        type: z
          .literal("userId")
          .or(z.literal("email"))
          .or(z.literal("username")),
      })
    )
    .query(async ({ input }) => {
      if (!input) return;
      console.log("Fetching user started", input);

      const userData = await getUser(input);
      console.log("Return user data", userData);
      return userData;
    }),
  search: t.procedure
    .input(z.object({ username: z.string(), searchValue: z.string() }))
    .query(async ({ input }) => {
      const { searchValue, username } = input;

      const searchedUsers = await getSeachedUsers(username, searchValue);
      return searchedUsers;
    }),
  create: t.procedure.input(createUserSchema).mutation(async ({ input }) => {
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
