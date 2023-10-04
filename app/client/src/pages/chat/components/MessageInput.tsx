import React, { FC, FormEvent, useEffect, useState } from "react";
import Icon from "../../main/components/Icon";
import useChatStore from "../../../utils/stores/chatStore";
import { cn } from "../../../utils/utils";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import getCurrentDate from "../../../utils/getCurrentDate";
import { TMessage } from "../../../../../server/src/types/types";
import { trpcVanilla } from "../../../utils/trpcClient";
import useStore from "../../../utils/stores/store";
import io from "socket.io-client";
import useUser from "../../../hooks/useUser";
const socket = io(import.meta.env.VITE_SERVER_URL);

interface MessageInputProps {
  iconRef: React.RefObject<HTMLDivElement>;
  scrollToStart: () => void;
  addNewMessageToChatCache: (messageData: TMessage) => void;
}

const MessageInput: FC<MessageInputProps> = ({
  addNewMessageToChatCache,
  iconRef,
  scrollToStart,
}) => {
  const {
    selectedImageFiles,
    addSelectedFile,
    removeSelectedFile,
    showEmojiPicker,
    setShowEmojiPicker,
    clearSelectedFiles,
    newMessage,
    setNewMessage,
    currentChatroom,
    isTyping,
    setIsTyping,
  } = useChatStore();
  const [imgUrls, setImgUrls] = useState<string[]>([]);
  const [isEmpty, setIsEmpty] = useState<boolean>(true);
  const { userId } = useStore();
  const [formData, setFormdata] = useState<FormData>(new FormData());
  const { userData } = useUser();

  useEffect(() => {
    setIsTyping(newMessage.length > 0);
  }, [newMessage]);

  useEffect(() => {
    socket.emit("typing", isTyping ? userData?.id : "");
  }, [isTyping]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentChatroom) return;
    const fileImage = e.target.files?.[0];

    if (fileImage) {
      const uniquePrefix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const filename = uniquePrefix + "-" + fileImage.name;
      const newFile = new File([fileImage], filename, { type: fileImage.type });

      formData.append("images", newFile);
      setFormdata(formData);

      const blob = URL.createObjectURL(newFile);

      setImgUrls((prev) => [...prev, blob]);
      addSelectedFile(newFile);
    }

    e.target.value = "";
  };

  useEffect(() => {
    setIsEmpty(imgUrls.length === 0);
  }, [imgUrls]);

  const removeFileFromArray = (id: number) => {
    const currentFile = selectedImageFiles.find((_, i) => i === id);
    const newFormData = new FormData();

    formData.forEach((x) => {
      if (x instanceof File && x.name !== currentFile?.name) {
        newFormData.append("images", x);
      }
    });
    setFormdata(newFormData);

    removeSelectedFile(id);
    setImgUrls((prevState) => prevState?.filter((_, index) => index !== id));
  };

  const showEmoji = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const createNewMessage = (data: {
    content: string;
    chatroom_id: string;
    isImage?: boolean;
    id?: string;
  }): TMessage => {
    const { content, id, chatroom_id, isImage } = data;

    return {
      id: id || uuidv4(),
      sender_id: userId,
      chatroom_id,
      created_at: getCurrentDate(),
      content,
      isImage: isImage || false,
    };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    scrollToStart();

    if (!currentChatroom) return;

    const { chatroom_id } = currentChatroom;

    if (newMessage.length > 0) {
      const messageData = createNewMessage({
        content: newMessage,
        isImage: false,
        chatroom_id,
      });

      addNewMessageToChatCache(messageData);
      setNewMessage("");
      if (messageData) await trpcVanilla.chat.messages.send.mutate(messageData);
    }

    if (selectedImageFiles.length > 0 && imgUrls?.length > 0) {
      const { chatroom_id } = currentChatroom;
      const arrayOfCreatedIds: string[] = [];

      for (const fileUrl of imgUrls) {
        const id = uuidv4();
        arrayOfCreatedIds.push(id);

        const messageData = createNewMessage({
          id,
          content: "",
          isImage: true,
          chatroom_id,
        });

        messageData.content = fileUrl;
        addNewMessageToChatCache(messageData);
      }

      setImgUrls([]);
      const data: {
        data: {
          message: string;
          urls: { key: string; size: number; type: string }[];
        };
      } = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const uploadedImages = data.data.urls.map((x) => x.key);

      for (let i = 0; i < uploadedImages.length; i++) {
        const currentId = arrayOfCreatedIds[i];

        const messageData = createNewMessage({
          content: import.meta.env.VITE_IMAGEKIT_PREFIX + uploadedImages[i],
          id: currentId,
          chatroom_id,
          isImage: true,
        });

        socket.emit("new-message", messageData);
        await trpcVanilla.chat.messages.send.mutate(messageData);
      }

      formData.delete("images");
      clearSelectedFiles();
    }
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
                <div>
                  <img className="h-12 w-12 rounded-lg" src={img} alt="image" />
                  <div
                    onClick={() => removeFileFromArray(id)}
                    className="absolute -right-1 -top-1 flex items-center rounded-full bg-zinc-300 p-[1px] text-zinc-600"
                  >
                    <Icon name="X" strokeWidth="3px" size="12px" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <div
        ref={iconRef}
        className={cn(
          isEmpty ? "" : "pt-[68px]",
          "absolute bottom-1/2 left-10 translate-y-1/2",
        )}
      >
        <Icon name="Smile" size="24px" onClick={showEmoji} />
      </div>
      {newMessage.length === 0 ? (
        <div
          className={cn(
            isEmpty ? "" : "pt-[68px]",
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
        onChange={(e) => setNewMessage(e.target.value)}
        // onBlur={() => socket.emit("typing", { userId: null })}
        className={cn(
          isEmpty ? "" : "pt-[68px]",
          "h-full rounded-3xl border-2 border-neutral-800 bg-black px-14 placeholder:text-white",
        )}
      />
      <div
        className={cn(
          isEmpty ? "" : "pt-[68px]",
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
