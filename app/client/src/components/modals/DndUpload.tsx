import React, { useRef, useState } from "react";
import Icon from "../../pages/main/components/Icon";
import Button from "../Button";
import { Upload } from "lucide-react";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend, NativeTypes } from "react-dnd-html5-backend";
import useModalStore from "../../utils/stores/modalStore";
import { cn, renameFile } from "../../utils/utils";
import useUser from "../../hooks/useUser";
import Avatar from "../avatar/Avatar";
import { motion } from "framer-motion";
import useOutsideClick from "../../hooks/useOutsideClick";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

const FileDropZone = ({ onDrop }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: [NativeTypes.FILE],
    drop: (item, monitor) => {
      if (monitor) {
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
      className="flex h-full w-full flex-col items-center justify-center space-y-4"
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
        <input
          type="file"
          className="absolute cursor-pointer opacity-0"
          onChange={(e) => onDrop(e.target.files![0])}
        />
        Select from computer
      </Button>
    </div>
  );
};

const DndUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [displayFile, setDisplayFile] = useState<string | null>(null);
  const { setIsDndUploadModalOpen } = useModalStore((state) => state.actions);
  const { userData } = useUser();
  const [caption, setCaption] = useState<string>("");
  const sendMessageModal = useRef<HTMLDivElement>(null);
  const { getToken } = useAuth();

  useOutsideClick([sendMessageModal], "mousedown", () => clear());

  const displayImage = (droppedFile: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setDisplayFile(reader.result as string);
    };
    reader.readAsDataURL(droppedFile);
    setFile(droppedFile);
  };

  const clear = () => {
    setCaption("");
    setFile(null);
    setDisplayFile(null);
    setIsDndUploadModalOpen(false);
  };

  const handleCaption = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    if (caption.length === 500) {
      if (inputValue.length < caption.length) {
        setCaption(inputValue);
      }
      return;
    }
    setCaption(inputValue);
  };

  const handleUploadFile = async () => {
    try {
      if (!file || !userData?.id) return;
      const renamed = renameFile(file);
      const formData = new FormData();

      const unified = {
        user_id: userData.id,
        caption,
      };

      formData.append("data", JSON.stringify(unified));
      formData.append("s3FolderName", "posts");
      formData.append("images", renamed);

      const url = "/api/imageUpload";
      const { data } = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      console.log("response", data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="absolute z-[1000] flex h-full w-screen items-center justify-center overflow-hidden bg-black bg-opacity-70">
        <motion.div
          ref={sendMessageModal}
          initial={{ width: file ? "880px" : "640px" }}
          animate={{ width: file ? "880px" : "640px" }}
          transition={{ ease: "easeInOut", duration: 0.3 }}
          className={cn(
            "flex h-[640px] flex-col items-start overflow-hidden rounded-xl bg-[#282828] pb-0 text-center",
          )}
        >
          <div className="relative flex h-12 w-full items-center justify-between border-[1px] border-x-0 border-t-0 border-b-neutral-600 p-3">
            <Icon
              className={cn(!displayFile ? "hidden" : "")}
              name="ArrowLeft"
              onClick={clear}
            />
            <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold">
              Create new post
            </p>
            {file ? (
              <p
                onClick={handleUploadFile}
                className="cursor-pointer text-blue-500 transition-colors hover:text-blue-300"
              >
                Upload
              </p>
            ) : (
              <Icon
                className="absolute right-0 top-0 -translate-y-1/2"
                name="X"
                onClick={() => setIsDndUploadModalOpen(false)}
              />
            )}
          </div>
          {file && displayFile ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ ease: "easeInOut", duration: 0.3 }}
              className="flex h-full w-full"
            >
              <img
                src={displayFile}
                alt="image"
                className="h-[640px] w-[640px]"
              />
              {file && (
                <div className="w-full space-y-2 p-2">
                  <div className="flex w-full items-center justify-start space-x-2">
                    <Avatar image_url={userData?.image_url} size="sm" />
                    <p className="">{userData?.username}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <textarea
                      cols={30}
                      rows={5}
                      maxLength={500}
                      value={caption}
                      placeholder="Write a caption..."
                      onChange={(e) => handleCaption(e)}
                      className="text-md bg-[#282828] p-1 outline-none placeholder:text-neutral-500"
                    >
                      {caption}
                    </textarea>
                    <span className="text-xs text-neutral-500">
                      {caption.length}/500
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <FileDropZone onDrop={displayImage} />
          )}
        </motion.div>
      </div>
    </DndProvider>
  );
};

export default DndUpload;
