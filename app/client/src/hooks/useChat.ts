import { FormEvent, useState } from "react";
import useChatStore from "../utils/state/chatStore";
import useUser from "./useUser";
import { v4 as uuidv4 } from "uuid";
import { TMessage } from "../../../server/src/types/types";
import getCurrentDate from "../utils/getCurrentDate";
import useChatCache from "./useChatCache";
import { trpc } from "../utils/trpcClient";
import { Skin } from "@emoji-mart/data";
import { uploadMultipartForm } from "../utils/utils";

const useChat = (scrollToStart?: () => void) => {
  const { userData, token } = useUser();
  const { chat } = trpc.useUtils();
  const selectedImageFiles = useChatStore((state) => state.selectedImageFiles);
  const {
    addSelectedFile,
    removeSelectedFile,
    setCurrentChatroom,
    clearSelectedFiles,
  } = useChatStore((state) => state.actions);
  const { addNewMessageToChatCache } = useChatCache();
  const currentChatroom = useChatStore((state) => state.currentChatroom);
  const { new_message, img_urls } = currentChatroom || {};
  const sendMessageMutation = trpc.chat.messages.send.useMutation();
  const [formData, setFormdata] = useState<FormData>(new FormData());

  const setMessage = (text: string) => {
    if (currentChatroom) {
      setCurrentChatroom({ ...currentChatroom, new_message: text });
    }
  };

  const setImgUrls = (img_urls: string[]) => {
    if (currentChatroom) setCurrentChatroom({ ...currentChatroom, img_urls });
  };

  const handleSelectEmoji = (e: Skin) => {
    setMessage(`${new_message}${e.native}`);
  };

  const removeFileFromArray = (id: number) => {
    // need better approach this sucks
    if (!img_urls) return;
    const currentFile = selectedImageFiles.find((_, i) => i === id);
    const newFormData = new FormData();
    formData.forEach((x) => {
      if (x instanceof File && x.name !== currentFile?.name) {
        newFormData.append("images", x);
      }
    });
    // setFiles((state) => state.filter((_, i) => i !== id));
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

  const sendTextMessage = async (new_message: string, chatroom_id: string) => {
    const messageData = createNewMessage({
      content: new_message,
      is_image: false,
      chatroom_id,
    });
    setMessage("");
    addNewMessageToChatCache(messageData);
    if (messageData) await sendMessageMutation.mutateAsync(messageData);
    // updateUserChatLastMessageCache(messageData);
  };

  const handleSubmitMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (scrollToStart) scrollToStart();
    if (currentChatroom) {
      const { chatroom_id, new_message, img_urls } = currentChatroom;
      if (new_message.length > 0)
        await sendTextMessage(new_message, chatroom_id);
      if (selectedImageFiles.length > 0 && img_urls?.length > 0) {
        await sendImageMessage(chatroom_id);
      }
    }
  };

  const sendImageMessage = async (chatroom_id: string) => {
    if (!img_urls) return;
    setImgUrls([]);
    const arrayOfCreatedIds: TMessage[] = [];

    for (const fileUrl of img_urls) {
      const id = uuidv4();
      const messageData = createNewMessage({
        id,
        chatroom_id,
        content: "",
        is_image: true,
      });
      messageData.content = fileUrl;
      arrayOfCreatedIds.push(messageData);
      addNewMessageToChatCache(messageData);
    }

    const uploadedImages = await uploadMultipartForm(
      "/api/upload/message",
      formData,
      token,
    );

    if (uploadedImages) {
      for (let i = 0; i < uploadedImages.length; i++) {
        const message = arrayOfCreatedIds[i];
        message.content = uploadedImages[i];
        await sendMessageMutation.mutateAsync(message);
      }
    }

    setImgUrls([]);
    formData.delete("images");
    clearSelectedFiles();
  };
  const userChats = chat.get.user_chatrooms.getData(userData?.id);

  return {
    handleSubmitMessage,
    setMessage,
    setImgUrls,
    removeFileFromArray,
    handleSelectEmoji,
    userChats,
    img_urls,
    fileSetter,
    new_message,
    currentChatroom,
    sendTextMessage,
  };
};

export default useChat;
