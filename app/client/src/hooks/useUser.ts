import { trpc } from "../utils/trpcClient";
import { CommonInput } from "../components/modals/EditProfileModal";
import useModalStore from "../utils/stores/modalStore";
import { useUser as useClerkUser } from "@clerk/clerk-react";
import { loadImage } from "../utils/utils";
import { TUserData } from "../../../server/src/types/types";

type TUserDataMutation = TUserData & {
  [key: string]: string | undefined;
};

const useUser = () => {
  const { user } = useClerkUser();
  const email = user?.emailAddresses[0].emailAddress;
  const ctx = trpc.useUtils();
  const userData = ctx.user.get.getData({
    data: email!,
    type: "email",
  });

  const updateUserCache = async (updatedData: CommonInput) => {
    const { image_url } = updatedData;
    ctx.user.get.setData({ data: email!, type: "email" }, (state) => {
      if (state && updatedData) {
        return Object.entries(state).reduce((obj, [key, val]) => {
          // @ts-expect-error skrt
          updatedData[key] ? (obj[key] = updatedData[key]) : (obj[key] = val);
          return obj;
        }, {} as TUserDataMutation);
      }
      return state;
    });
    if (image_url) await loadImage(image_url);
  };

  return {
    userData,
    updateUserCache,
  };
};

export default useUser;
