import { trpc } from "../utils/trpcClient";
import useStore from "../utils/stores/generalStore";
import { CommonInput } from "../components/modals/EditProfileModal";
import { TUserData } from "../../../server/src/types/types";
import useModalStore from "../utils/stores/modalStore";
import { loadImage } from "../utils/utils";
import { useCallback } from "react";

const useUser = () => {
  const userId = useStore((state) => state.userId);
  const email = useStore((state) => state.email);
  const ctx = trpc.useContext();
  const userData = ctx.user.get.getData({ data: email, type: "email" });
  const { setIsAvatarUpdating } = useModalStore((state) => state.actions);

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
    // if (image_url && image_url.length > 0) await loadImage(image_url);
    // setIsAvatarUpdating(false);
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
    updateUserCache,
    email,
    userId,
  };
};

export default useUser;
