import { FormEvent, useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import useChatStore from "../utils/stores/chatStore";
import useUser from "./useUser";
import { v4 as uuidv4 } from "uuid";
import { TMessage } from "../../../server/src/types/types";
import getCurrentDate from "../utils/getCurrentDate";
import useChatCache from "./useChatCache";
import { trpc, trpcVanilla } from "../utils/trpcClient";
import { useParams } from "react-router-dom";
import { Skin } from "@emoji-mart/data";
import {  uploadMultipartForm } from "../utils/utils";
import { nanoid } from "nanoid";

const useChat = (socket?: Socket, scrollToStart?: () => void) => {
  const { userData, userId } = useUser();
  const [formData, setFormdata] = useState<FormData>(new FormData());
  const { chatRoomId } = useParams();
  const ctx = trpc.useContext();

  const {
    selectedImageFiles,
    addSelectedFile,
    removeSelectedFile,
    clearSelectedFiles,
    isTyping,
    setIsTyping,
  } = useChatStore();
  const { addNewMessageToChatCache } = useChatCache();

  const { data: currentChatroom, isLoading } =
    trpc.chat.get.currentChatRoom.useQuery(
      { chatroom_id: chatRoomId as string, user_id: userId },
      {
        enabled: !!chatRoomId && !!userId,
      },
    );
  const { new_message, img_urls, chatroom_id } = currentChatroom || {};

  const setMessage = (text: string) => {
    ctx.chat.get.currentChatRoom.setData(
      {
        chatroom_id: chatRoomId as string,
        user_id: userId,
      },
      (stale) => {
        if (stale) {
          return { ...stale, new_message: text };
        }
      },
    );
  };

  const setImgUrls = (img_urls: string[]) => {
    console.log("setting img urls", img_urls);
    // ctx.chat.get.user_chatrooms.setData(
    //   userId,
    //   (stale) =>
    //     stale?.map((x) =>
    //       x.chatroom_id === chatRoomId ? { ...x, img_urls } : x,
    //     ),
    // );
    ctx.chat.get.currentChatRoom.setData(
      { chatroom_id: chatRoomId as string, user_id: userId },
      (stale) => {
        if (stale) {
          return { ...stale, img_urls };
        }
      },
    );
  };

  // useEffect(() => {
  //   if (!currentChatroom) return;
  //   setMessage(currentChatroom?.new_message);
  //   setIsTyping(currentChatroom?.new_message.length > 0);
  // }, [currentChatroom]);

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
    isImage?: boolean;
    id?: string;
  }): TMessage => {
    const { content, id, chatroom_id, isImage } = data;

    return {
      id: id || uuidv4(),
      sender_id: userId,
      created_at: getCurrentDate(),
      isImage: isImage || false,
      chatroom_id,
      content,
    };
  };

  const fileSetter = (newFile: File) => {
    if (!currentChatroom) return;
    formData.append("images", newFile);
    setFormdata(formData);

    const blob = URL.createObjectURL(newFile);

    console.log("new blolb", blob);
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
      isImage: false,
      chatroom_id,
    });
    addNewMessageToChatCache(messageData);
    setMessage("");
    if (messageData) await trpcVanilla.chat.messages.send.mutate(messageData);
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
        isImage: true,
        chatroom_id,
      });

      messageData.content = fileUrl;
      addNewMessageToChatCache(messageData);
    }

    setImgUrls([]);
    const uploadedImages = await uploadMultipartForm(
      "/api/image-upload/message",
      formData,
    );

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
  };

  return {
    handleSubmit,
    renameFile,
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
