import { trpc } from "../lib/trpcClient";
import { CommonInput } from "../components/modals/EditProfileModal";
import { loadImage } from "../utils/image";
import { TUserData } from "../../../server/src/types/types";
import useGeneralStore from "../lib/stores/generalStore";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";

type TUserDataMutation = TUserData & {
  [key: string]: string | undefined;
};

const useUser = () => {
  const username = useGeneralStore((state) => state.username);
  const { getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  const ctx = trpc.useUtils();
  const userData = ctx.user.get.getData({
    data: username!,
    type: "username",
  });

  useEffect(() => {
    const fetchToken = async () => {
      const fetchedToken = await getToken();
      setToken(fetchedToken);
    };
    fetchToken();
  }, []);

  const updateUserCache = async (updatedData: CommonInput) => {
    if (!userData) return;
    const { image_url } = updatedData;
    ctx.user.get.setData(
      { data: userData!.username, type: "username" },
      (state) => {
        if (state && updatedData) {
          return Object.entries(state).reduce((obj, [key, val]) => {
            updatedData[key] ? (obj[key] = updatedData[key]) : (obj[key] = val);
            return obj;
          }, {} as TUserDataMutation);
        }
        return state;
      },
    );
    if (image_url && !image_url.startsWith("blob:")) await loadImage(image_url);
  };

  return {
    userData,
    token,
    updateUserCache,
  };
};

export default useUser;
