import React, { FC, RefObject, useMemo, useState } from "react";
import Icon from "../Icon";
import Button from "../Button";
import { Loader2, Upload } from "lucide-react";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend, NativeTypes } from "react-dnd-html5-backend";
import useModalStore from "../../utils/state/modalStore";
import { cn, loadImage, renameFile } from "../../utils/utils";
import useUser from "../../hooks/useUser";
import Avatar from "../avatar/Avatar";
import { motion } from "framer-motion";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { trpc } from "../../utils/trpcClient";
import { TPost } from "../../../../server/src/types/types";
import { Modal } from "./Modals";
import useOutsideClick from "../../hooks/useOutsideClick";
import useWindowSize from "../../hooks/useWindowSize";

interface Props {
  onDrop: (droppedFile: File) => void;
}

const FileDropZone: FC<Props> = ({ onDrop }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: [NativeTypes.FILE],
    drop: (_, monitor) => {
      if (monitor) {
        // @ts-expect-error skkd
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
        Select from computer
      </Button>
    </div>
  );
};

type ModalProps = {
  modalRef: RefObject<HTMLDivElement>;
};

const DndUploadModal: FC<ModalProps> = ({ modalRef }) => {
  const [file, setFile] = useState<File | null>(null);
  const [displayFile, setDisplayFile] = useState<string | null>(null);
  const { setIsDndUploadModalOpen } = useModalStore((state) => state.actions);
  const { userData } = useUser();
  const [caption, setCaption] = useState<string>("");
  const { getToken } = useAuth();
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const ctx = trpc.useUtils();
  const [modalTitle, setModalTitle] = useState<
    "Create new post" | "Processing" | "Post uploaded"
  >("Create new post");
  useOutsideClick([modalRef], "mousedown", () => clearAndClose());

  const displayImage = (droppedFile: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setDisplayFile(reader.result as string);
    };
    reader.readAsDataURL(droppedFile);
    setFile(droppedFile);
  };

  const clearAndClose = () => {
    clear();
    setIsDndUploadModalOpen(false);
  };

  const clear = () => {
    setCaption("");
    setFile(null);
    setDisplayFile(null);
    setModalTitle("Create new post");
  };

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

  const handleUploadPost = async () => {
    try {
      if (!file || !userData?.id) return;
      setIsUploading(true);
      setModalTitle("Processing");

      const renamed = renameFile(file);
      const formData = new FormData();
      const unified = {
        user_id: userData.id,
        caption,
      };

      formData.append("serialized", JSON.stringify(unified));
      formData.append("uploadPost", renamed);

      const { data }: { data: TPost } = await axios.post(
        "/api/uploadMedia/post",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${await getToken()}`,
          },
        },
      );

      await loadImage(data.media_url);
      ctx.user.get.setData(
        { data: userData.username, type: "username" },
        (state) => {
          if (state) {
            return { ...state, posts: [...state.posts, data] };
          }
        },
      );

      setIsUploading(false);
      setModalTitle("Post uploaded");
      // setIsDndUploadModalOpen(false);
    } catch (error) {
      console.log(error);
    }
  };
  const { width } = useWindowSize();
  const modalWidth = useMemo(() => {
    if (file) {
      return width > 840 ? (file ? "880px" : "600px") : "calc(100vw - 40px)";
    } else {
      return width > 640 ? (file ? "880px" : "600px") : "calc(100vw - 40px)";
    }
  }, [width, file]);

  return (
    <DndProvider backend={HTML5Backend}>
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
          className={cn(
            "flex h-[600px] flex-col items-start overflow-hidden rounded-xl bg-[#282828] pb-0 text-center",
          )}
        >
          <div className="relative flex h-12 w-full items-center justify-between border-[1px] border-x-0 border-t-0 border-b-neutral-600 p-3">
            <Icon
              className={cn(!displayFile ? "hidden" : "")}
              name="ArrowLeft"
              onClick={clear}
            />
            <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold">
              {modalTitle}
            </p>
            {file && modalTitle === "Create new post" ? (
              <p
                className="cursor-pointer text-blue-500 transition-colors hover:text-blue-300"
                onClick={handleUploadPost}
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
              {file && displayFile ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ ease: "easeInOut", duration: 0.3 }}
                  className="flex"
                >
                  <div className="h-[600px] w-full">
                    <img src={displayFile} alt="image" />
                  </div>
                  <div className="w-[280px]">
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
                <FileDropZone onDrop={displayImage} />
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
};

export default DndUploadModal;
