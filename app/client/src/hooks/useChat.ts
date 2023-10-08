import { FormEvent, useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import useChatStore from "../utils/stores/chatStore";
import useUser from "./useUser";
import { v4 as uuidv4 } from "uuid";
import { TMessage } from "../../../server/src/types/types";
import getCurrentDate from "../utils/getCurrentDate";
import useChatCache from "./useChatCache";
import { trpcVanilla } from "../utils/trpcClient";
import axios from "axios";

type TUseChatProps = {
  socket: Socket;
  scrollToStart: () => void;
};

const useChat = ({ socket, scrollToStart }: TUseChatProps) => {
  const { userData, userId } = useUser();
  const [formData, setFormdata] = useState<FormData>(new FormData());
  const [imgUrls, setImgUrls] = useState<string[]>([]);
  const [isEmpty, setIsEmpty] = useState<boolean>(true);

  const {
    selectedImageFiles,
    addSelectedFile,
    removeSelectedFile,
    clearSelectedFiles,
    newMessage,
    setNewMessage,
    currentChatroom,
    isTyping,
    setIsTyping,
  } = useChatStore();
  const { addNewMessageToChatCache } = useChatCache();

  useEffect(() => {
    setIsTyping(newMessage.length > 0);
  }, [newMessage]);

  useEffect(() => {
    socket.emit(
      "typing",
      isTyping
        ? { userId: userData?.id, chatroom_id: currentChatroom?.chatroom_id }
        : { userId: "", chatroom_id: currentChatroom?.chatroom_id },
    );
  }, [isTyping]);

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
      await sendImageMessages(chatroom_id);
    }
  };

  const sendImageMessages = async (chatroom_id: string) => {
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
    await uploadImages(arrayOfCreatedIds, chatroom_id);
  };

  const uploadImages = async (
    arrayOfCreatedIds: string[],
    chatroom_id: string,
  ) => {
    try {
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
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  return {
    isEmpty,
    handleSubmit,
    handleFileChange,
    imgUrls,
    setImgUrls,
    removeFileFromArray,
  };
};

export default useChat;
