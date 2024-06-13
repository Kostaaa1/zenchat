import React, {
  FC,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Icon from "../Icon";
import Button from "../Button";
import { Loader2, Upload } from "lucide-react";
import useModalStore from "../../lib/stores/modalStore";
import { cn } from "../../utils/utils";
import { generateThumbnailFile, loadImage } from "../../utils/image";
import useUser from "../../hooks/useUser";
import Avatar from "../avatar/Avatar";
import { motion } from "framer-motion";
import { trpc } from "../../lib/trpcClient";
import { Modal } from "./Modals";
import useWindowSize from "../../hooks/useWindowSize";
import { toast } from "react-toastify";
import useGeneralStore from "../../lib/stores/generalStore";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend, NativeTypes } from "react-dnd-html5-backend";
import { nanoid } from "nanoid";
import { TPost } from "../../../../server/src/types/types";
import axios from "axios";
import Video from "../Video";

interface Props {
  onDrop: (droppedFile: File) => void;
}

const Dropzone: FC<Props> = ({ onDrop }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: [NativeTypes.FILE],
    drop: (_, monitor) => {
      if (monitor) {
        // @ts-expect-error ofc
        const files = monitor.getItem().files;
        const droppedFile = files[0];
        if (onDrop) {
          onDrop(droppedFile);
        }
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className="flex h-full w-full flex-col items-center justify-center space-y-2"
    >
      <div className="flex h-11 w-11">
        <Upload
          strokeWidth={1.2}
          className={cn(
            "h-full w-full rounded-md p-1 text-neutral-400 ring-2 ring-neutral-400",
            isOver && "text-blue-500 ring-blue-500",
          )}
        />
      </div>
      <p className="text-xl tracking-wide">Drag photos and videos here</p>
      <Button className="relative cursor-pointer" buttonColor="blue">
        <label
          className="absolute w-full cursor-pointer opacity-0"
          htmlFor="fileInput"
        >
          <input
            id="fileInput"
            type="file"
            onChange={(e) => onDrop(e.target.files![0])}
          />
        </label>
        Select from your device
      </Button>
    </div>
  );
};

const DndUploadModal = forwardRef<HTMLDivElement>((_, ref) => {
  const FILE_LIMIT_MB = 310;
  const FILE_LIMIT_BYTES = FILE_LIMIT_MB * 1024 * 1024;
  const { closeModal } = useModalStore((state) => state.actions);
  const { userData, token } = useUser();
  const utils = trpc.useUtils();
  const isMobile = useGeneralStore((state) => state.isMobile);
  const [file, setFile] = useState<File | null>(null);
  const [mediaSrc, setMediaSrc] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [modalTitle, setModalTitle] = useState<
    "Create new post" | "Processing" | "Post uploaded"
  >("Create new post");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDndFile = (dndFile: File) => {
    if (dndFile.size > FILE_LIMIT_BYTES) {
      toast.error(`The maximux file size is ${FILE_LIMIT_MB}MB`);
      return;
    }
    if (mediaSrc) URL.revokeObjectURL(mediaSrc);
    setFile(dndFile);
    const blobURL = URL.createObjectURL(dndFile);
    setMediaSrc(blobURL);
  };

  const triggerFileError = () => {
    toast.error(
      "Error selecting the video. The format may not be supported or file may be corrupted.",
    );
    setFile(null);
    setMediaSrc(null);
  };

  useEffect(() => {
    console.log(file);
  }, [file]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener("error", triggerFileError);
    }
  }, [mediaSrc]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    if (caption.length === 500) {
      if (inputValue.length < caption.length) setCaption(inputValue);
      return;
    }
    setCaption(inputValue);
  };

  const clearAndClose = () => {
    if (isUploading) {
      toast.warn("Uploading is in action");
      return;
    }
    closeModal();
    clear();
  };

  const clear = () => {
    setCaption("");
    setFile(null);
    setMediaSrc(null);
    setModalTitle("Create new post");
  };

  const handleCreatingPost = async () => {
    if (!file || !userData?.id) return;
    setModalTitle("Processing");
    setIsUploading(true);
    const { name, type, size } = file;
    let thumbnailFile: File | null = null;

    if (type.startsWith("video/") && mediaSrc) {
      const tmbName = "thumbnail-" + name.replace(".mp4", ".jpg");
      try {
        const thumbnail = await generateThumbnailFile(mediaSrc, tmbName);
        thumbnailFile = thumbnail.file;
      } catch (error) {
        console.log("Generating thumbnail failed..", error);
      }
    }

    const formData = new FormData();
    const unified: Partial<TPost> = {
      id: nanoid(),
      user_id: userData.id,
      caption,
      type,
      media_name: name,
      size,
      thumbnail_url: thumbnailFile?.name ?? null,
    };

    formData.append("serialized", JSON.stringify(unified));
    formData.append("post", file);
    if (thumbnailFile) formData.append("post", thumbnailFile);

    const url = `${import.meta.env.VITE_SERVER_URL}/api/upload/post/${
      type.startsWith("video/") ? "video" : "image"
    }`;

    try {
      const { data }: { data: TPost } = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      await loadImage(data.thumbnail_url ?? data.media_url);
      utils.user.get.setData(
        { data: userData.username, type: "username" },
        (state) => {
          if (state) {
            return { ...state, posts: [data, ...state.posts] };
          }
        },
      );
      setIsUploading(false);
      setModalTitle("Post uploaded");
    } catch (error) {
      console.log("Error uploading post", error);
    }
  };

  const { width } = useWindowSize();
  const modalWidth = useMemo(() => {
    if (file) {
      return width > 940 ? (file ? "880px" : "700px") : "calc(100vw - 60px)";
    } else {
      return width > 720 ? (file ? "880px" : "700px") : "calc(100vw - 60px)";
    }
  }, [width, file]);

  return (
    <DndProvider backend={HTML5Backend}>
      <Modal>
        <motion.div
          ref={ref}
          initial={{
            width: modalWidth,
          }}
          animate={{
            width: modalWidth,
          }}
          transition={{ ease: "easeInOut", duration: 0.3 }}
          className="flex h-[90vw] max-h-[90vh] flex-col items-start overflow-hidden rounded-xl bg-[#282828] pb-0 text-center md:h-[700px]"
        >
          <div className="relative flex h-12 w-full items-center justify-between border-[1px] border-x-0 border-t-0 border-b-neutral-600 p-2">
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
                  className={cn(
                    "relative flex h-full",
                    isMobile && "w-full flex-col",
                  )}
                >
                  <div className="">
                    {file.type.startsWith("image/") && (
                      <img src={mediaSrc} alt={mediaSrc} />
                    )}
                    {file.type.startsWith("video/") && (
                      <Video
                        ref={videoRef}
                        media_url={mediaSrc}
                        controls={false}
                        autoPlay={true}
                        className="h-full w-[700px] object-cover"
                      />
                    )}
                  </div>
                  <div
                    className={cn(
                      "w-[280px]",
                      isMobile &&
                        "absolute bottom-0 h-[244px] w-full bg-[#282828]",
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
                        className="text-md bg-[#282828] p-1 outline-none ring-[#282828] placeholder:text-neutral-500"
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
                <Dropzone onDrop={handleDndFile} />
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
    </DndProvider>
  );
});

export default DndUploadModal;
