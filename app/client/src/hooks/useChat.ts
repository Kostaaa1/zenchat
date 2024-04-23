import { FormEvent, useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import useChatStore from "../utils/stores/chatStore";
import useUser from "./useUser";
import { v4 as uuidv4 } from "uuid";
import { TMessage } from "../../../server/src/types/types";
import getCurrentDate from "../utils/getCurrentDate";
import useChatCache from "./useChatCache";
import { trpc } from "../utils/trpcClient";
import { useParams } from "react-router-dom";
import { Skin } from "@emoji-mart/data";
import { uploadMultipartForm } from "../utils/utils";
import { useAuth } from "@clerk/clerk-react";
import { nanoid } from "nanoid";

const useChat = (socket?: Socket, scrollToStart?: () => void) => {
  const { userData } = useUser();
  const [formData, setFormdata] = useState<FormData>(new FormData());
  const { chatRoomId } = useParams();
  const { chat } = trpc.useUtils();
  const { getToken } = useAuth();
  const isTyping = useChatStore((state) => state.isTyping);
  const selectedImageFiles = useChatStore((state) => state.selectedImageFiles);
  const { addSelectedFile, removeSelectedFile, clearSelectedFiles } =
    useChatStore((state) => state.actions);

  const { addNewMessageToChatCache } = useChatCache();
  const { data: currentChatroom } = trpc.chat.get.currentChatRoom.useQuery(
    { chatroom_id: chatRoomId as string, user_id: userData!.id },
    {
      enabled: !!chatRoomId && !!userData,
    },
  );
  const { new_message, img_urls, chatroom_id } = currentChatroom || {};
  const sendMessageMutation = trpc.chat.messages.send.useMutation();

  const setMessage = (text: string) => {
    chat.get.currentChatRoom.setData(
      {
        chatroom_id: chatRoomId as string,
        user_id: userData!.id,
      },
      (stale) => {
        if (stale) {
          return { ...stale, new_message: text };
        }
      },
    );
  };

  const setImgUrls = (img_urls: string[]) => {
    chat.get.currentChatRoom.setData(
      { chatroom_id: chatRoomId as string, user_id: userData!.id },
      (stale) => {
        if (stale) {
          return { ...stale, img_urls };
        }
      },
    );
  };

  useEffect(() => {
    if (!socket) return;
    socket.emit(
      "typing",
      isTyping
        ? { userId: userData?.id, chatroom_id }
        : { userId: "", chatroom_id },
    );
  }, [isTyping]);

  const handleSelectEmoji = (e: Skin) => {
    setMessage(`${new_message}${e.native}`);
  };

  const removeFileFromArray = (id: number) => {
    if (!img_urls) return;

    const currentFile = selectedImageFiles.find((_, i) => i === id);
    const newFormData = new FormData();

    formData.forEach((x) => {
      if (x instanceof File && x.name !== currentFile?.name) {
        newFormData.append("images", x);
      }
    });

    setFormdata(newFormData);
    removeSelectedFile(id);

    const filteredData = img_urls?.filter((_, index) => index !== id);
    setImgUrls(filteredData);
  };

  const createNewMessage = (data: {
    content: string;
    chatroom_id: string;
    is_image?: boolean;
    id?: string;
  }): TMessage => {
    const { content, id, chatroom_id, is_image } = data;

    return {
      id: id || uuidv4(),
      sender_id: userData!.id,
      created_at: getCurrentDate(),
      is_image: is_image || false,
      chatroom_id,
      content,
    };
  };

  const fileSetter = (newFile: File) => {
    if (!currentChatroom) return;
    formData.append("images", newFile);
    setFormdata(formData);

    const blob = URL.createObjectURL(newFile);
    setImgUrls([...currentChatroom.img_urls, blob]);
    addSelectedFile(newFile);
  };

  const renameFile = (fileImage: File, cb?: (file: File) => void) => {
    // const uniquePrefix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const uniquePrefix = nanoid();
    const chatroomPrefix = currentChatroom?.chatroom_id.split("-")[0];
    const filename = `${chatroomPrefix}-${uniquePrefix}-${fileImage.name}`;
    const newFile = new File([fileImage], filename, { type: fileImage.type });
    if (cb) cb(newFile);
    return newFile;
  };

  const sendTextMessage = async (new_message: string, chatroom_id: string) => {
    const messageData = createNewMessage({
      content: new_message,
      is_image: false,
      chatroom_id,
    });
    addNewMessageToChatCache(messageData);
    setMessage("");
    if (messageData) await sendMessageMutation.mutateAsync(messageData);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (scrollToStart) scrollToStart();

    if (!currentChatroom) return;
    const { chatroom_id, new_message, img_urls } = currentChatroom;

    if (new_message.length > 0) {
      await sendTextMessage(new_message, chatroom_id);
    }

    if (selectedImageFiles.length > 0 && img_urls?.length > 0) {
      await sendImageMessage(chatroom_id);
    }
  };

  const sendImageMessage = async (chatroom_id: string) => {
    if (!img_urls || !socket) return;
    const arrayOfCreatedIds: string[] = [];

    for (const fileUrl of img_urls) {
      const id = uuidv4();
      arrayOfCreatedIds.push(id);

      const messageData = createNewMessage({
        id,
        content: "",
        is_image: true,
        chatroom_id,
      });

      messageData.content = fileUrl;
      addNewMessageToChatCache(messageData);
    }

    setImgUrls([]);
    const uploadedImages = await uploadMultipartForm(
      "/api/uploadMedia/message",
      formData,
      getToken,
    );

    for (let i = 0; i < uploadedImages.length; i++) {
      const currentId = arrayOfCreatedIds[i];

      const messageData = createNewMessage({
        content: import.meta.env.VITE_IMAGEKIT_PREFIX + uploadedImages[i],
        id: currentId,
        chatroom_id,
        is_image: true,
      });

      socket.emit("new-message", messageData);
      await sendMessageMutation.mutateAsync(messageData);
    }

    formData.delete("images");
    clearSelectedFiles();
  };

  return {
    handleSubmit,
    // renameFile,
    setMessage,
    setImgUrls,
    removeFileFromArray,
    handleSelectEmoji,
    img_urls,
    fileSetter,
    new_message,
    currentChatroom,
    sendTextMessage,
  };
};

export default useChat;
