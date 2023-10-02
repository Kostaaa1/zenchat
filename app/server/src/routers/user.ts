import { z } from "zod";
import { t } from "../trpc";
import {
  createUser,
  getSeachedUsers,
  getUser,
  getUserWithUsername,
} from "../utils/supabase/user";
import { createUserSchema } from "../types/zodSchemas";

export const userRouter = t.router({
  getUser: t.procedure
    .input(z.string().nullish())
    .query(async ({ input: email }) => {
      if (!email) return;

      const userData = await getUser(email);
      return userData;
    }),
  getUserWithUsername: t.procedure
    .input(z.string().nullish())
    .query(async ({ input }) => {
      if (!input) {
        throw new Error("Invalid params!");
      }
      const userData = await getUserWithUsername(input);
      return userData || null;
    }),
  searchUser: t.procedure
    .input(z.object({ username: z.string(), searchValue: z.string() }))
    .query(async ({ input }) => {
      const { searchValue, username } = input;

      const searchedUsers = await getSeachedUsers(username, searchValue);
      return searchedUsers;
    }),
  createUser: t.procedure
    .input(createUserSchema)
    .mutation(async ({ input }) => {
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
        return null;
      }
    }),
});
// updataUserImage: t.procedure.query(() => {
//   const USERS_TABLE = "users";
//   if (!user) {
//     throw new Error("No user data in getUserDataFromDb");
//   }
//   const { username, imageUrl, firstName, lastName } = user;
//   const email = user.emailAddresses[0]?.emailAddress;
//   ////
//   const updataUserImage = async (image_url: string, email: string) => {
//     const { data: updatedData, error } = await supabase
//       .from("users")
//       .update({ image_url })
//       .match({ email });
//     if (!updatedData || error) {
//       throw new Error(error?.message);
//     }
//     return updatedData[0] as TUserData;
//   };
// }),
