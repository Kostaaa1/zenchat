import React, { FC } from "react";
import Icon from "../../main/components/Icon";
import useChatStore from "../../../utils/stores/chatStore";
import { cn } from "../../../utils/utils";
import io from "socket.io-client";
import useChat from "../../../hooks/useChat";
const socket = io(import.meta.env.VITE_SERVER_URL);

interface MessageInputProps {
  iconRef: React.RefObject<HTMLDivElement>;
  scrollToStart: () => void;
}

const MessageInput: FC<MessageInputProps> = ({ iconRef, scrollToStart }) => {
  const { showEmojiPicker, setShowEmojiPicker, newMessage, setNewMessage } =
    useChatStore();

  const {
    handleFileChange,
    handleSubmit,
    isEmpty,
    removeFileFromArray,
    imgUrls,
  } = useChat({ socket, scrollToStart });

  const showEmoji = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(isEmpty ? "h-16" : "h-40", "relative flex w-full px-4")}
    >
      {!isEmpty ? (
        <div className="absolute left-10 top-3">
          <div className="flex">
            {imgUrls.map((img, id) => (
              <div key={img} className="relative mr-2">
                <img className="h-12 w-12 rounded-lg" src={img} alt="image" />
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
                type="file"
                id="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>
      ) : null}
      <div
        ref={iconRef}
        className={cn(
          isEmpty ? "" : "pt-[69px]",
          "absolute bottom-1/2 left-10 translate-y-1/2",
        )}
      >
        <Icon name="Smile" size="24px" onClick={showEmoji} />
      </div>
      {newMessage.length === 0 && isEmpty ? (
        <div
          className={cn(
            isEmpty ? "" : "pt-[69px]",
            "absolute bottom-1/2 right-10 flex w-14 translate-y-1/2 justify-between",
          )}
        >
          <div>
            <label htmlFor="file">
              <Icon name="Image" size="24px" onClick={showEmoji} />
            </label>
            <input
              type="file"
              id="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <Icon name="Heart" size="24px" onClick={showEmoji} />
        </div>
      ) : null}
      <input
        type="text"
        placeholder="Send Message..."
        value={newMessage}
        // onBlur={() => socket.emit("typing", { userId: null })}
        onChange={(e) => setNewMessage(e.target.value)}
        className={cn(
          isEmpty ? "" : "pt-[69px]",
          "h-full rounded-3xl border-2 border-neutral-800 bg-black px-14 placeholder:text-white",
        )}
      />
      <div
        className={cn(
          isEmpty ? "" : "pt-[69px]",
          "absolute bottom-1/2 right-10 translate-y-1/2",
        )}
      >
        {newMessage.length > 0 ? (
          <input
            type="submit"
            value="Send"
            className="cursor-pointer text-[#538dd8] hover:text-white"
          />
        ) : null}
      </div>
    </form>
  );
};

export default MessageInput;
