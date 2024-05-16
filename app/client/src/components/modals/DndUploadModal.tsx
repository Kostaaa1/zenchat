import React, {
  FC,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Icon from "../Icon";
import Button from "../Button";
import { Loader2, Tablet, Upload } from "lucide-react";
import useModalStore from "../../utils/state/modalStore";
import { cn, generateThumbnailFile, loadImage } from "../../utils/utils";
import useUser from "../../hooks/useUser";
import Avatar from "../avatar/Avatar";
import { motion } from "framer-motion";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { trpc } from "../../utils/trpcClient";
import { TPost, TUserData } from "../../../../server/src/types/types";
import { Modal } from "./Modals";
import useOutsideClick from "../../hooks/useOutsideClick";
import useWindowSize from "../../hooks/useWindowSize";
import { toast } from "react-toastify";
import { nanoid } from "nanoid";
import { generateReactHelpers, useDropzone } from "@uploadthing/react";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { OurFileRouter } from "../../../../server/src/uploadthing";
import useGeneralStore from "../../utils/state/generalStore";

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();

type ModalProps = {
  modalRef: RefObject<HTMLDivElement>;
};

const DndUploadModal: FC<ModalProps> = ({ modalRef }) => {
  const { setIsDndUploadModalOpen } = useModalStore((state) => state.actions);
  const { userData, token } = useUser();
  const utils = trpc.useUtils();
  useOutsideClick([modalRef], "mousedown", () => clearAndClose());
  const [caption, setCaption] = useState<string>("");
  const [modalTitle, setModalTitle] = useState<
    "Create new post" | "Processing" | "Post uploaded"
  >("Create new post");
  const [file, setFile] = useState<File[] | null>(null);
  const [mediaSrc, setMediaSrc] = useState<string | null>(null);
  const [thumbnailSrc, setThumbnailSrc] = useState<string | null>(null);
  const isMobile = useGeneralStore((state) => state.isMobile);

  const FILE_LIMIT_MB = 310;
  const FILE_LIMIT_BYTES = FILE_LIMIT_MB * 1024 * 1024;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const dndFile = acceptedFiles[0];
    const reader = new FileReader();

    if (dndFile.size > FILE_LIMIT_BYTES) {
      toast.error(`The maximux file size is ${FILE_LIMIT_MB}MB`);
      return;
    }

    reader.onload = () => {
      const result = reader.result;
      if (!result) return;
      const blob = new Blob([result], { type: dndFile.type });
      const ulr = URL.createObjectURL(blob);
      setMediaSrc(ulr);
    };

    reader.readAsArrayBuffer(dndFile);
    setFile(acceptedFiles);
  }, []);

  const uploadPostMutation = trpc.posts.upload.useMutation({
    onSuccess: async (post) => {
      if (!post || !mediaSrc) return;
      if (thumbnailSrc) post["thumbnail_url"] = thumbnailSrc;
      post["media_url"] = mediaSrc;

      utils.user.get.setData(
        {
          data: userData!.username,
          type: "username",
        },
        (state) => {
          if (state) {
            console.log("post", post);
            return { ...state, posts: [post, ...state.posts] };
          }
        },
      );
      setModalTitle("Post uploaded");
    },
    onError: (error) => {
      console.log("Mutation error: ", error);
    },
  });

  const { permittedFileInfo, startUpload, isUploading } = useUploadThing(
    "post",
    {
      skipPolling: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      onClientUploadComplete: async (data) => {
        console.log(data);
        const { name, type, size, url } = data[0];
        const thumbnail_url =
          data[1] && data[1].name.startsWith("thumbnail") ? data[1].url : null;

        const unified = {
          id: nanoid(),
          user_id: userData!.id,
          caption,
          type,
          media_name: name,
          size,
          thumbnail_url,
          media_url: url,
        };
        uploadPostMutation.mutate(unified);
      },
      onUploadError: () => {
        console.log("error occurred while uploading");
      },
      onUploadBegin: () => {
        console.log("upload has begun");
      },
    },
  );

  const fileTypes = permittedFileInfo?.config
    ? Object.keys(permittedFileInfo?.config)
    : [];

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: fileTypes ? generateClientDropzoneAccept(fileTypes) : undefined,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    if (caption.length === 500) {
      if (inputValue.length < caption.length) {
        setCaption(inputValue);
      }
      return;
    }
    setCaption(inputValue);
  };

  const clearAndClose = () => {
    if (isUploading) {
      toast.warn("Uploading is in action");
      return;
    }
    clear();
    setIsDndUploadModalOpen(false);
  };

  const clear = () => {
    setCaption("");
    setFile(null);
    setMediaSrc(null);
    setThumbnailSrc(null);
    setModalTitle("Create new post");
  };

  const handleCreatingPost = async () => {
    if (!file || !userData?.id) return;
    setModalTitle("Processing");
    const { name, type } = file[0];

    let thumbnailFile: File | null = null;
    if (type.startsWith("video/") && mediaSrc) {
      const tmbName = "thumbnail-" + name.replace(".mp4", ".jpg");
      const thumbnail = await generateThumbnailFile(mediaSrc, tmbName);
      setThumbnailSrc(thumbnail.url);
      thumbnailFile = thumbnail.file;
    }
    if (thumbnailFile) file.push(thumbnailFile);
    startUpload(file);
  };

  const { width } = useWindowSize();
  const modalWidth = useMemo(() => {
    if (file) {
      return width > 920 ? (file ? "880px" : "660px") : "calc(100vw - 40px)";
    } else {
      return width > 700 ? (file ? "880px" : "660px") : "calc(100vw - 40px)";
    }
  }, [width, file]);

  return (
      <Modal>
        <motion.div
          ref={modalRef}
          initial={{
            width: modalWidth,
          }}
          animate={{
            width: modalWidth,
          }}
          transition={{ ease: "easeInOut", duration: 0.3 }}
          className="flex h-[100vw] flex-col items-start overflow-hidden rounded-xl bg-[#282828] pb-0 text-center sm:h-[660px]"
        >
          <div className="relative flex h-12 w-full items-center justify-between border-[1px] border-x-0 border-t-0 border-b-neutral-600 p-3">
            <Icon
              className={cn(!mediaSrc ? "hidden" : "")}
              name="ArrowLeft"
              onClick={clear}
            />
            <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold">
              {modalTitle}
            </p>
            {file && modalTitle === "Create new post" ? (
              <p
                className="cursor-pointer text-blue-500 transition-colors hover:text-blue-300"
                onClick={handleCreatingPost}
              >
                Upload
              </p>
            ) : (
              <Icon
                className="absolute right-0 top-0 -translate-y-1/2"
                name="X"
                onClick={clearAndClose}
              />
            )}
          </div>
          {!isUploading ? (
            <>
              {mediaSrc && file ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ ease: "easeInOut", duration: 0.3 }}
                  className={cn("flex h-full", isMobile && "w-full flex-col")}
                >
                  <div className="">
                    {file[0].type.startsWith("image/") && (
                      <img src={mediaSrc} alt={mediaSrc} />
                    )}
                    {file[0].type.startsWith("video/") && (
                      <video
                        loop
                        id="videoId"
                        autoPlay={true}
                        className="h-full w-[650px] object-cover"
                        onLoadStart={(e) => (e.currentTarget.volume = 0.05)}
                      >
                        <source src={mediaSrc} type="video/mp4" />
                      </video>
                    )}
                  </div>
                  <div
                    className={cn(
                      "w-[280px]",
                      isMobile && "sticky bottom-0 w-full bg-[#282828]",
                    )}
                  >
                    <div className="flex w-full items-center justify-start space-x-2 border-[1px] border-x-0 border-t-0 border-b-neutral-600 p-2">
                      <Avatar image_url={userData?.image_url} size="sm" />
                      <p className="">{userData?.username}</p>
                    </div>
                    <div className="flex flex-col items-end px-2">
                      <textarea
                        cols={30}
                        rows={5}
                        maxLength={500}
                        value={caption}
                        placeholder="Write a caption..."
                        onChange={(e) => handleInputChange(e)}
                        className="text-md bg-[#282828] p-1 outline-none placeholder:text-neutral-500"
                      >
                        {caption}
                      </textarea>
                      <span className="text-xs text-neutral-500">
                        {caption.length}/500
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div
                  {...getRootProps()}
                  className="flex h-full w-full flex-col items-center justify-center space-y-2"
                >
                  <div className="flex h-11 w-11">
                    <Upload
                      strokeWidth={1.2}
                      className={cn(
                        "h-full w-full rounded-md p-1 text-neutral-400 ring-2 ring-neutral-400",
                        isDragActive && "text-blue-500 ring-blue-500",
                      )}
                    />
                  </div>
                  <p className="text-xl tracking-wide">
                    Drag photos and videos here
                  </p>
                  <input {...getInputProps()} />
                  <Button
                    className="relative cursor-pointer"
                    buttonColor="blue"
                  >
                    Select from computer
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="absolute right-1/2 top-1/2 -translate-y-1/2 translate-x-1/2">
              {modalTitle === "Post uploaded" ? (
                <motion.div>div</motion.div>
              ) : (
                <Loader2
                  className="animate-spin"
                  size={60}
                  strokeWidth={1}
                  gradientTransform="linear-gradient(315deg, #9979d3 0%, #ff80cb 100%)"
                />
              )}
            </div>
          )}
        </motion.div>
      </Modal>
  );
};

export default DndUploadModal;
