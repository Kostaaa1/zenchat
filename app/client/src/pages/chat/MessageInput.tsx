import React, { FC, FormEvent } from "react";
import Icon from "../main/components/Icon";
import useMessageStore from "../../utils/stores/messageStore";

interface MessageInputProps {
  iconRef: React.RefObject<HTMLDivElement>;
  handleSendMessage: (e: FormEvent) => void;
}

const MessageInput: FC<MessageInputProps> = ({
  handleSendMessage,
  iconRef,
}) => {
  const { showEmojiPicker, setShowEmojiPicker, message, setMessage } =
    useMessageStore();
  return (
    <form
      onSubmit={handleSendMessage}
      className="relative flex h-14 w-full px-4"
    >
      <div
        ref={iconRef}
        className="absolute bottom-1/2 left-10 translate-y-1/2"
      >
        <Icon
          name="Smile"
          size="24px"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        />
      </div>
      <input
        type="text"
        placeholder="Send Message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="h-full rounded-full border-2 border-neutral-800 bg-black px-14 placeholder:text-white"
      />
      <div className="absolute bottom-1/2 right-10 translate-y-1/2">
        {message.length > 0 ? (
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
