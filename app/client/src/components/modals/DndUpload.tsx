import React, { useEffect, useState } from "react";
import Icon from "../../pages/main/components/Icon";
import Button from "../Button";
import { Image, Upload } from "lucide-react";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend, NativeTypes } from "react-dnd-html5-backend";
import useModalStore from "../../utils/stores/modalStore";
import { cn } from "../../utils/utils";

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
          className="h-full w-full rounded-md p-1 text-neutral-400 ring-2 ring-neutral-400"
        />
      </div>
      <p className="text-xl tracking-wide">Drag photos and videos here</p>
      <Button className="relative" buttonColor="blue">
        <input
          type="file"
          className="absolute opacity-0"
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

  const displayImage = (droppedFile: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setDisplayFile(reader.result as string);
    };
    reader.readAsDataURL(droppedFile);
    setFile(droppedFile);
  };

  const clearFile = () => {
    setDisplayFile(null);
    setFile(null);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="absolute z-[1000] flex h-full w-screen items-center justify-center overflow-hidden bg-black bg-opacity-70">
        <div
          // ref={sendMessageModal}
          className="flex h-[650px] w-[650px] flex-col items-start overflow-hidden rounded-xl bg-[#282828] pb-0 text-center"
        >
          <div className="relative flex h-12 w-full items-center justify-between border-[1px] border-x-0 border-t-0 border-b-neutral-600 p-3">
            <Icon
              className={cn(!displayFile ? "hidden" : "")}
              name="ArrowLeft"
              onClick={clearFile}
            />
            <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold">
              Create new post
            </p>
            <Icon
              className="absolute right-0 top-0 -translate-y-1/2"
              name="X"
              onClick={() => setIsDndUploadModalOpen(false)}
            />
          </div>
          {file && displayFile ? (
            <div className="flex h-full w-full">
              <img
                src={displayFile}
                alt="image"
                className="h-[650px] w-[650px]"
              />
              {/* <div className="z-[100000] h-full w-48 overflow-hidden bg-black bg-opacity-70">
                KOSDAS
              </div> */}
            </div>
          ) : (
            <FileDropZone onDrop={displayImage} />
          )}
        </div>
      </div>
    </DndProvider>
  );
};

export default DndUpload;
