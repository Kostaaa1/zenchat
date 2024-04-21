import { trpc } from "../utils/trpcClient";
import { CommonInput } from "../components/modals/EditProfileModal";
import { loadImage } from "../utils/utils";
import { TUserData } from "../../../server/src/types/types";
import useGeneralStore from "../utils/stores/generalStore";
import { useQueryClient } from "@tanstack/react-query";

type TUserDataMutation = TUserData & {
  [key: string]: string | undefined;
};

const useUser = () => {
  const queryClient = useQueryClient();
  const username = useGeneralStore((state) => state.username);
  const ctx = trpc.useUtils();
  const userData = ctx.user.get.getData({
    data: username!,
    type: "username",
  });

  const updateUserCache = async (updatedData: CommonInput) => {
    if (!userData) return;
    const { image_url } = updatedData;
    ctx.user.get.setData(
      { data: userData!.username, type: "username" },
      (state) => {
        if (state && updatedData) {
          return Object.entries(state).reduce((obj, [key, val]) => {
            // @ts-expect-error skrt
            updatedData[key] ? (obj[key] = updatedData[key]) : (obj[key] = val);
            return obj;
          }, {} as TUserDataMutation);
        }
        return state;
      },
    );
    if (image_url) await loadImage(image_url);
  };

  const removeLoggedUserQuery = (name: string) => {
    const key = queryClient
      .getQueryCache()
      .getAll()
      .find((x) => x.queryKey[1].input.data === name)?.queryKey;
    queryClient.removeQueries({ queryKey: key });
  };

  return {
    userData,
    updateUserCache,
    removeLoggedUserQuery,
  };
};

export default useUser;
