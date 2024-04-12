import { trpc } from "../utils/trpcClient";
import useStore from "../utils/stores/store";
import { CommonInput } from "../components/modals/EditProfileModal";
import { TUserData } from "../../../server/src/types/types";
import useModalStore from "../utils/stores/modalStore";
import { useCallback } from "react";

const useUser = () => {
  const { userId, email } = useStore();
  const ctx = trpc.useContext();
  const userData = ctx.user.get.getData({ data: email, type: "email" });
  const { setIsAvatarUpdating } = useModalStore();

  type TUserDataMutation = TUserData & {
    [key: string]: string | undefined;
  };

  const updateUserCache = async (updatedData: CommonInput) => {
    const { image_url } = updatedData;

    ctx.user.get.setData({ data: email, type: "email" }, (state) => {
      if (state && updatedData) {
        return Object.entries(state).reduce((obj, [key, val]) => {
          updatedData[key] ? (obj[key] = updatedData[key]) : (obj[key] = val);

          return obj;
        }, {} as TUserDataMutation);
      }

      return state;
    });

    if (image_url && image_url.length > 0) await loadUpdatedImage(image_url);
  };

  const loadUpdatedImage = useCallback(
    (image_url: string) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = image_url;
        img.onload = () => {
          setIsAvatarUpdating(false);
          resolve(true);
        };

        img.onerror = () => {
          reject(false);
        };
      });
    },
    [updateUserCache],
  );

  return {
    userData,
    email,
    userId,
    updateUserCache,
  };
};

export default useUser;
