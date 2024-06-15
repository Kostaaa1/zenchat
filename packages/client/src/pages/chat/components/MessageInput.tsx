import React, { FC, FormEvent, useRef } from "react";
import Icon from "../../../components/Icon";
import useChatStore from "../../../lib/stores/chatStore";
import { cn } from "../../../utils/utils";
import { EmojiPickerContainer } from "./EmojiPicker";
import { TChatroom } from "../../../../../server/src/types/types";
import useMessageInput from "../../../hooks/useMessageInput";

interface MessageInputProps {
  iconRef: React.RefObject<HTMLDivElement>;
  scrollToStart: () => void;
  activeChatroom: TChatroom;
}

const MessageInput: FC<MessageInputProps> = ({
  iconRef,
  scrollToStart,
  activeChatroom,
}) => {
  const emojiRef = useRef<HTMLDivElement>(null);
  const {
    sendMessage,
    handleFileChange,
    imageInputs,
    messageInput,
    removeFileFromStack,
    handleInputChange,
    selectEmoji,
  } = useMessageInput(activeChatroom);
  const { setShowEmojiPicker } = useChatStore((state) => state.actions);
  const { showEmojiPicker } = useChatStore((state) => ({
    showEmojiPicker: state.showEmojiPicker,
  }));

  const showEmoji = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleSubmit = (e: FormEvent) => {
    sendMessage(e);
    scrollToStart();
  };

  return (
    <div className="px-4">
      {activeChatroom && (
        <form
          onSubmit={handleSubmit}
          className={cn(
            "relative flex",
            imageInputs.length === 0 ? "h-14" : "h-[124px]",
          )}
        >
          {imageInputs.length > 0 && (
            <div className="absolute left-6 top-3">
              <div className="flex">
                {imageInputs?.map((img, id) => (
                  <div key={img} className="relative mr-2">
                    <img
                      className="h-12 w-12 rounded-lg"
                      src={img}
                      alt="image"
                    />
                    <div
                      onClick={() => removeFileFromStack(id)}
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
              "absolute bottom-1/2 left-6 translate-y-1/2",
            )}
          >
            <Icon name="Smile" size="24px" onClick={showEmoji} />
          </div>
          {!messageInput && imageInputs?.length === 0 && (
            <div className="absolute bottom-1/2 right-6 flex translate-y-1/2 justify-between">
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
              "absolute bottom-1/2 right-6 translate-y-1/2",
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
        selectEmoji={selectEmoji}
        emojiRef={emojiRef}
        showEmojiPicker={showEmojiPicker}
      />
    </div>
  );
};

export default MessageInput;
