import { useQuery } from "@tanstack/react-query";
import supabase from "../../lib/supabaseClient";
import { IUserData } from "../utils/store";
import { useUser } from "@clerk/clerk-react";

const useCachedUser = () => {
  const { user } = useUser();

  const getUserDataFromDb = async (): Promise<IUserData | null> => {
    try {
      const USERS_TABLE = "users";
      if (!user) return null;

      const { username, imageUrl, firstName, lastName } = user;
      const email = user.emailAddresses[0]?.emailAddress;

      const { data } = await supabase
        .from(USERS_TABLE)
        .select("*")
        .eq("email", email);

      const userData = data as IUserData[];

      if (!userData || userData.length === 0) {
        console.log("There is not user in db, creating...", {
          username,
          imageUrl,
          firstName,
          lastName,
        });
        const { data: newUserData } = await supabase
          .from(USERS_TABLE)
          .insert({
            username,
            email,
            image_url: imageUrl,
            first_name: firstName,
            last_name: lastName,
          })
          .select("*");

        const typedNewUserData = newUserData as IUserData[];
        return typedNewUserData[0] || null;
      }

      if (imageUrl !== userData[0].image_url) {
        const { data: updatedData } = await supabase
          .from(USERS_TABLE)
          .update({ image_url: imageUrl })
          .match({ email });

        if (!updatedData) return null;
        return updatedData[0] as IUserData;
      }

      return userData[0] as IUserData;
    } catch (error) {
      console.error("Error fetching/updating user data:", error);
      return null;
    }
  };

  const queryData = useQuery(["user-data"], getUserDataFromDb, {
    enabled: !!user,
  });
  return {
    userData: queryData.data,
    ...queryData,
  };
};

export default useCachedUser;
