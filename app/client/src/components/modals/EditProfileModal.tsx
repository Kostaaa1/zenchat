import { useEffect, useRef, useState } from "react";
import useOutsideClick from "../../hooks/useOutsideClick";
import useModalStore from "../../utils/stores/modalStore";
import Icon from "../../pages/main/components/Icon";
import Avatar from "../avatar/Avatar";
import useUser from "../../hooks/useUser";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { renameFile, uploadMultipartForm } from "../../utils/utils";
import { useAuth } from "@clerk/clerk-react";
import { trpc } from "../../utils/trpcClient";
import { Modal } from "./Modals";

export type CommonInput = {
  first_name?: string;
  last_name?: string;
  username?: string;
  image_url?: string | undefined;
  [key: string]: string | undefined;
};

export type Inputs = CommonInput & {
  file: FileList;
};

const EditProfileModal = () => {
  const editUserRef = useRef<HTMLFormElement>(null);
  const [file, setFile] = useState<string>("");
  const { userData, updateUserCache } = useUser();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const updateAvatarMutation = trpc.user.updateAvatar.useMutation({
    onSuccess: async (updatedAvater: string) => {
      await updateUserCache({ image_url: updatedAvater });
      setIsAvatarUpdating(false);
    },
  });
  const { setIsEditProfileModalOpen, setIsAvatarUpdating } = useModalStore(
    (state) => state.actions,
  );
  const updateUserDataMutation = trpc.user.updateUserData.useMutation();
  const { register, handleSubmit, watch } = useForm<Inputs>();
  useOutsideClick([editUserRef], "mousedown", () =>
    setIsEditProfileModalOpen(false),
  );

  const handleUpload = async (newFile: File) => {
    try {
      setIsAvatarUpdating(true);
      const renamedFile = renameFile(newFile);
      const formData = new FormData();
      formData.append("images", renamedFile);

      const uploadedImages = await uploadMultipartForm(
        "/api/uploadMedia/avatar",
        formData,
        getToken,
      );

      updateAvatarMutation.mutate({
        userId: userData!.id,
        image_url: import.meta.env.VITE_IMAGEKIT_PREFIX + uploadedImages[0],
      });
    } catch (error) {
      console.log(error);
    }
  };

  const onSubmit: SubmitHandler<Inputs> = async (formData: Inputs) => {
    setIsEditProfileModalOpen(false);
    const { file } = formData;
    if (file.length > 0) await handleUpload(file[0]);
    if (Object.values(formData).every((x) => x?.length === 0)) return;

    const extractedData = Object.keys(formData)
      .filter((x) => formData[x]!.length > 0 && x !== "file")
      .reduce((obj, key) => {
        obj[key] = formData[key];
        return obj;
      }, {} as CommonInput);

    updateUserCache(extractedData);
    const { username } = extractedData;
    if (username && username.length > 0) navigate(`/${username}`);
    await updateUserDataMutation.mutateAsync({
      userId: userData!.id,
      userData: extractedData,
    });
  };

  useEffect(() => {
    const newFile = watch("file");
    if (newFile.length === 0) return;
    const url = URL.createObjectURL(newFile[0]);
    setFile(url);
  }, [watch("file")]);

  return (
    <Modal>
      <form
        ref={editUserRef}
        onSubmit={handleSubmit(onSubmit)}
        className="flex h-[340px] w-[420px] flex-col items-center rounded-xl bg-[#262626] p-3 text-center"
      >
        <div className="flex w-full items-center justify-between">
          <div className="relative flex items-center justify-between">
            <p className="pl-8 text-base font-semibold text-neutral-300">
              Edit Profile
            </p>
            <div
              onClick={() => setIsEditProfileModalOpen(false)}
              className="absolute top-1/2 -translate-y-1/2 cursor-pointer rounded-full text-neutral-300 transition-colors duration-200 hover:bg-white hover:bg-opacity-10"
            >
              <Icon name="X" className="p-[2px]" size="26px" />
            </div>
          </div>
          <input
            type="submit"
            value="Save"
            className="w-max cursor-pointer rounded-lg bg-white px-3 py-[2px] font-bold text-black outline-none transition-all duration-200 hover:bg-opacity-80"
          />
        </div>
        <div className="flex w-full items-center justify-center py-8">
          <div className="relative h-max w-max">
            <label
              htmlFor="file"
              className="absolute left-0 top-0 z-10 block h-full w-full cursor-pointer rounded-full bg-black bg-opacity-0 
        outline transition-all duration-200 hover:bg-opacity-20"
            ></label>
            <input
              id="file"
              {...register("file")}
              type="file"
              className="hidden"
            />
            <Avatar
              image_url={file.length > 0 ? file : userData?.image_url}
              size="semiXl"
            />
          </div>
        </div>
        <div className="flex h-full w-full flex-col items-center justify-around">
          <input
            placeholder="Username"
            type="text"
            {...register("username")}
            defaultValue={userData?.username}
            className="center flex rounded-lg bg-neutral-600 bg-opacity-20 py-2 pl-2 text-sm text-neutral-400 outline-none placeholder:text-neutral-400"
          />
          <input
            placeholder="First name"
            defaultValue={userData?.first_name}
            {...register("first_name")}
            type="text"
            className="center flex rounded-lg bg-neutral-600 bg-opacity-20 py-2 pl-2 text-sm text-neutral-400 outline-none placeholder:text-neutral-400"
          />
          <input
            placeholder="Last name"
            defaultValue={userData?.last_name}
            {...register("last_name")}
            type="text"
            className="center flex rounded-lg bg-neutral-600 bg-opacity-20 py-2 pl-2 text-sm text-neutral-400 outline-none placeholder:text-neutral-400"
          />
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal;
