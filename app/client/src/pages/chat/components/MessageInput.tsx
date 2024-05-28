import React, { ChangeEvent, FC, useEffect, useRef, useState } from "react";
import Icon from "../../../components/Icon";
import useChatStore from "../../../lib/stores/chatStore";
import { cn } from "../../../utils/utils";
import { renameFile } from "../../../utils/file";
import { EmojiPickerContainer } from "./EmojiPicker";
import { TChatroom } from "../../../../../server/src/types/types";
import useChatMapStore from "../../../lib/stores/chatMapStore";
import useChat from "../../../hooks/useChat";

interface MessageInputProps {
  iconRef: React.RefObject<HTMLDivElement>;
  scrollToStart: () => void;
  activeChatroom: TChatroom;
}

const MessageInput: FC<MessageInputProps> = ({
  activeChatroom,
  iconRef,
  scrollToStart,
}) => {
  const { setShowEmojiPicker } = useChatStore((state) => state.actions);
  const { showEmojiPicker } = useChatStore((state) => ({
    showEmojiPicker: state.showEmojiPicker,
  }));

  const { addChatInputMessage } = useChatMapStore((state) => state.actions);
  const { inputImages, inputMessages } = useChatMapStore((state) => ({
    inputMessages: state.inputMessages,
    inputImages: state.inputImages,
  }));

  const { fileSetter, removeFileFromArray, handleSubmitMessage } =
    useChat(scrollToStart);

  const emojiRef = useRef<HTMLDivElement>(null);
  const showEmoji = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e?.target?.files?.[0];
    if (file) renameFile(file, activeChatroom?.chatroom_id, fileSetter);
    e.target.value = "";
  };

  const [imageInputs, setImageInputs] = useState<string[]>([]);
  const [messageInput, setMessageInput] = useState<string>("");

  useEffect(() => {
    if (!activeChatroom) return;

    const a = inputImages.get(activeChatroom.chatroom_id) ?? [];
    const b = inputMessages.get(activeChatroom.chatroom_id) ?? "";

    setImageInputs(a);
    setMessageInput(b);
  }, [activeChatroom, inputImages, inputMessages]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    let { value } = e.target;
    if (value.length === 0) value = "";
    addChatInputMessage(activeChatroom.chatroom_id, value);
  };

  return (
    <>
      {activeChatroom && (
        <form
          onSubmit={handleSubmitMessage}
          className={cn(
            imageInputs.length === 0 ? "h-14" : "h-40",
            "relative flex w-full px-4",
          )}
        >
          {imageInputs.length > 0 && (
            <div className="absolute left-10 top-3">
              <div className="flex">
                {imageInputs?.map((img, id) => (
                  <div key={img} className="relative mr-2">
                    <img
                      className="h-12 w-12 rounded-lg"
                      src={img}
                      alt="image"
                    />
                    <div
                      onClick={() => removeFileFromArray(id)}
                      className="absolute right-0 top-0 flex -translate-y-[2px] translate-x-1 items-center rounded-full bg-zinc-300 p-[1px] text-zinc-600"
                    >
                      <Icon name="X" strokeWidth="3px" size="10px" />
                    </div>
                  </div>
                ))}
                <label
                  htmlFor="file"
                  className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-lg bg-white bg-opacity-20 transition-all duration-200 hover:bg-opacity-25"
                >
                  <Icon name="Image" size="28" strokeWidth="1.3" />
                  <input
                    name="file"
                    type="file"
                    id="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
          )}
          <div
            ref={iconRef}
            className={cn(
              imageInputs?.length === 0 ? "" : "pt-[69px]",
              "absolute bottom-1/2 left-10 translate-y-1/2",
            )}
          >
            <Icon name="Smile" size="24px" onClick={showEmoji} />
          </div>
          {!messageInput && imageInputs?.length === 0 && (
            <div className="absolute bottom-1/2 right-2 flex w-14 translate-y-1/2 justify-between">
              <label htmlFor="file">
                <Icon name="Image" size="24px" />
              </label>
              <input
                type="file"
                id="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          )}
          <input
            type="text"
            placeholder="Send Message..."
            value={messageInput}
            onChange={handleInputChange}
            className={cn(
              imageInputs?.length === 0 ? "" : "pt-[69px]",
              "h-full rounded-3xl border-2 border-[#262626] bg-black px-14 placeholder:text-white",
            )}
          />
          <div
            className={cn(
              imageInputs?.length === 0 ? "" : "pt-[69px]",
              "absolute bottom-1/2 right-10 translate-y-1/2",
            )}
          >
            {(messageInput || imageInputs?.length > 0) && (
              <input
                type="submit"
                value="Send"
                className="cursor-pointer font-semibold text-lightBlue hover:text-white"
              />
            )}
          </div>
        </form>
      )}
      <EmojiPickerContainer
        emojiRef={emojiRef}
        showEmojiPicker={showEmojiPicker}
      />
    </>
  );
};

export default MessageInput;
