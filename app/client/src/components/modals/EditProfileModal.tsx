import { forwardRef, useEffect, useState } from "react";
import useModalStore from "../../utils/state/modalStore";
import Icon from "../Icon";
import Avatar from "../avatar/Avatar";
import useUser from "../../hooks/useUser";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { loadImage, renameFile, uploadMultipartForm } from "../../utils/utils";
import { trpc } from "../../utils/trpcClient";
import { Modal } from "./Modals";
import { useUser as useClerkUser } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";

export type CommonInput = {
  first_name?: string;
  last_name?: string;
  username?: string;
  image_url?: string | undefined;
  description?: string;
  [key: string]: string | undefined;
};

export type Inputs = CommonInput & {
  file: FileList;
};

const EditProfileModal = forwardRef<HTMLDivElement>((_, ref) => {
  const { user } = useClerkUser();
  const [fileUrl, setFileUrl] = useState<string>("");
  const { userData, token, updateUserCache } = useUser();
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closeModal, setIsAvatarUpdating } = useModalStore(
    (state) => state.actions,
  );
  const isAvatarUpdating = useModalStore((state) => state.isAvatarUpdating);
  const {
    register,
    formState: { errors, isDirty, dirtyFields },
    setError,
    handleSubmit,
    watch,
    reset,
  } = useForm<Inputs>();

  const updateUserDataMutation = trpc.user.updateUserData.useMutation({
    onSuccess: async (data) => {
      console.log("On success", data);
      const { username, last_name, first_name } = data;
      await user?.update({
        username,
        firstName: first_name,
        lastName: last_name,
      });
      await utils.user.get.refetch({
        data: userData!.username,
        type: "username",
      });
      setFileUrl("");
      setIsLoading(false);
      reset();
      navigate(`/${username}`);
    },
    onError: (error) => {
      const { data } = error;
      if (data?.httpStatus === 422) {
        setError("username", {
          type: "custom",
          message:
            "Failed to update since username already exists. Please try using different username.",
        });
      }
    },
  });

  const updateAvatarMutation = trpc.user.updateAvatar.useMutation({
    onSuccess: async (newAvatar) => {
      if (newAvatar) {
        await loadImage(newAvatar);
        await updateUserCache({ image_url: newAvatar });
        setIsAvatarUpdating(false);
        setFileUrl(newAvatar);
      }
    },
  });

  const onSubmit: SubmitHandler<Inputs> = async (formData: Inputs) => {
    try {
      if (!userData) return;
      console.log("Frodamd data", formData);
      const { file } = formData;
      setIsLoading(true);
      if (file && file.length > 0) {
        setIsAvatarUpdating(true);

        const renamedFile = renameFile(file[0]);
        const form = new FormData();
        form.append("images", renamedFile);
        const uploadedImages = await uploadMultipartForm(
          "/api/upload/avatar",
          form,
          token,
        );

        await updateAvatarMutation.mutateAsync({
          userId: userData!.id,
          image_url: uploadedImages[0],
        });
      }

      if (Object.values(dirtyFields).length === 1 && dirtyFields.file) {
        setIsLoading(false);
        reset();
        return;
      }

      utils.user.get.invalidate({
        data: userData?.username,
        type: "username",
      });

      // @ts-expect-error dsako
      delete formData.file;
      delete formData.image_url;
      updateUserDataMutation.mutate({
        userId: userData.id,
        userData: formData,
      });
    } catch (error) {
      console.log("From server error: ", error);
      // @ts-expect-error dskao
      if (error.status === 422) {
        setError("username", {
          type: "custom",
          message:
            "Failed to update since username already exists. Please try using different username.",
        });
      }
    }
  };

  useEffect(() => {
    const newFile = watch("file");
    if (newFile.length > 0 && newFile[0].type.split("/")[0] !== "image") {
      setError("file", {
        type: "custom",
        message: "The file that is provided is not an image",
      });
      return;
    }
    if (newFile.length === 0) return;
    const url = URL.createObjectURL(newFile[0]);
    setFileUrl(url);
  }, [watch("file")]);

  return (
    <Modal>
      <div ref={ref}>
        <form
          onSubmit={() => handleSubmit(onSubmit)}
          autoComplete="off"
          className="w- flex w-[90vw] max-w-[450px] flex-col items-center rounded-xl bg-[#262626] p-3 text-center"
        >
          <div className="flex w-full items-center justify-between">
            <div className="relative flex items-center justify-between">
              <p className="pl-8 text-base font-semibold text-neutral-300">
                Edit Profile
              </p>
              <div
                onClick={() => closeModal()}
                className="absolute top-1/2 -translate-y-1/2 rounded-full text-neutral-300 transition-colors duration-200 hover:bg-white hover:bg-opacity-10"
              >
                <Icon name="X" className="cursor-pointer p-[2px]" size="26px" />
              </div>
            </div>
            {isAvatarUpdating || isLoading ? (
              <div className="flex w-16 cursor-pointer items-center justify-center rounded-lg bg-white px-3 py-[2px] font-bold text-black text-opacity-70 outline-none transition-all duration-200 hover:bg-opacity-80">
                <Loader2 className="animate-spin" />
              </div>
            ) : (
              <input
                disabled={!isDirty}
                type="submit"
                value="Save"
                className="w-16 cursor-pointer rounded-lg bg-white px-3 py-[2px] font-bold text-black outline-none transition-all duration-200 hover:bg-opacity-80"
              />
            )}
          </div>
          <div className="flex w-full flex-col items-center justify-center space-y-2 py-8">
            <div className="relative h-max w-max">
              <label
                htmlFor="file"
                className="absolute left-0 top-0 z-10 block h-full w-full cursor-pointer rounded-full bg-black bg-opacity-0 
        transition-all duration-200 hover:bg-opacity-20"
              ></label>
              <input
                id="file"
                {...register("file")}
                type="file"
                className="hidden"
              />
              <Avatar
                image_url={fileUrl.length > 0 ? fileUrl : userData?.image_url}
                size="xl"
                className="outline"
              />
            </div>
            <div className="text-sm text-red-600">
              {errors.file && errors.file.type === "custom" && (
                <span>{errors.file.message}</span>
              )}
            </div>
          </div>
          <div className="flex h-full w-full flex-col items-start justify-around space-y-2">
            <div className="flex w-full flex-col items-start justify-start">
              <input
                placeholder="Username"
                type="text"
                {...register("username", {
                  pattern: {
                    value: /^[a-z0-9]+$/,
                    message: "Entered value does not match email format",
                  },
                  maxLength: 25,
                  minLength: 3,
                })}
                defaultValue={userData?.username}
                className="flex rounded-lg bg-neutral-600 bg-opacity-20 py-2 pl-2 text-sm text-neutral-400 outline-none placeholder:text-neutral-400"
              />
              <div className="text-sm text-red-600">
                {errors.username && errors.username.type === "maxLength" && (
                  <span>
                    Exceeded the maximum number of characters for an username
                    (25)
                  </span>
                )}
                {errors.username && errors.username.type === "minLength" && (
                  <span>
                    The username needs to be at least 3 characters long.
                  </span>
                )}
                {errors.username && errors.username.type === "pattern" && (
                  <span>The username needs to be lower cased.</span>
                )}
                {errors.username && errors.username.type === "custom" && (
                  <span>The username is used. Use different username.</span>
                )}
              </div>
            </div>
            <div className="flex w-full flex-col items-start justify-start">
              <input
                placeholder="First name"
                defaultValue={userData?.first_name}
                {...register("first_name")}
                type="text"
                className="flex rounded-lg bg-neutral-600 bg-opacity-20 py-2 pl-2 text-sm text-neutral-400 outline-none placeholder:text-neutral-400"
              />
            </div>
            <div className="flex w-full flex-col items-start justify-start">
              <input
                placeholder="Last name"
                defaultValue={userData?.last_name}
                {...register("last_name")}
                type="text"
                className="flex rounded-lg bg-neutral-600 bg-opacity-20 py-2 pl-2 text-sm text-neutral-400 outline-none placeholder:text-neutral-400"
              />
            </div>
            <textarea
              cols={30}
              rows={4}
              maxLength={20}
              defaultValue={userData?.description || ""}
              {...register("description")}
              placeholder="About you"
              className="flex w-full rounded-lg bg-neutral-600 bg-opacity-20 py-2 pl-2 text-sm text-neutral-400 outline-none placeholder:text-neutral-400"
            ></textarea>
          </div>
        </form>
      </div>
    </Modal>
  );
});

export default EditProfileModal;
