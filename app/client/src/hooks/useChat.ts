import { FormEvent, useState } from "react";
import useChatStore from "../lib/stores/chatStore";
import useUser from "./useUser";
import { v4 as uuidv4 } from "uuid";
import { S3UploadResponse, TMessage } from "../../../server/src/types/types";
import { getCurrentDate } from "../utils/date";
import useChatCache from "./useChatCache";
import { trpc } from "../lib/trpcClient";
import { Skin } from "@emoji-mart/data";
import useChatMapStore from "../lib/stores/chatMapStore";
import axios from "axios";

const useChat = (scrollToStart?: () => void) => {
  const { userData, token } = useUser();
  const { chat } = trpc.useUtils();
  const inputImages = useChatMapStore((state) => state.inputImages);
  const inputMessages = useChatMapStore((state) => state.inputMessages);
  const {
    addChatInputImage,
    clearMessageInput,
    removeChatInputImage,
    clearImagesInput,
    addChatInputMessage,
  } = useChatMapStore((state) => state.actions);
  const { activeChatroom } = useChatStore((state) => ({
    activeChatroom: state.activeChatroom,
  }));
  const { addNewMessageToChatCache } = useChatCache();
  const [formData, setFormdata] = useState<FormData>(new FormData());
  const sendMessageMutation = trpc.chat.messages.send.useMutation();
  const [trackFiles, setTrackFiles] = useState<File[]>([]);

  const handleSelectEmoji = (e: Skin) => {
    if (activeChatroom) {
      const { chatroom_id } = activeChatroom;
      const input_message = inputMessages.get(chatroom_id);
      addChatInputMessage(chatroom_id, `${input_message}${e.native}`);
    }
  };

  const fileSetter = (newFile: File) => {
    if (!activeChatroom) return;
    formData.append("images", newFile);
    setFormdata(formData);

    const blob = URL.createObjectURL(newFile);
    addChatInputImage(activeChatroom.chatroom_id, blob);

    const added = [...trackFiles, newFile];
    setTrackFiles(added);
  };

  const removeFileFromArray = (id: number) => {
    if (activeChatroom) {
      const chatroomID = activeChatroom.chatroom_id;
      const imageUrls = inputImages.get(chatroomID);
      // if (!imageUrls) return;
      // const updatedImageUrls = imageUrls?.filter((url, index) => {
      //   if (index === id) {
      //     URL.revokeObjectURL(url);
      //     return false;
      //   }
      //   return true;
      // });
      // console.log("updated image ulrs", updatedImageUrls);
      // inputImages.set(chatroomID, updatedImageUrls);

      removeChatInputImage(chatroomID, id);
      setTrackFiles((state) => state.filter((_, index) => index !== id));
      const newFormData = new FormData();

      formData.forEach((value) => {
        if (value instanceof File && value.name !== trackFiles[id].name) {
          newFormData.append("images", value);
        }
      });
      setFormdata(newFormData);
    }
  };

  const createNewMessage = (data: {
    content: string;
    chatroom_id: string;
    is_image: boolean;
    id?: string;
  }): TMessage => {
    const { content, id, chatroom_id, is_image } = data;
    return {
      id: id ?? uuidv4(),
      sender_id: userData!.id,
      sender_username: userData!.username,
      created_at: getCurrentDate(),
      is_image,
      chatroom_id,
      content,
    };
  };

  const sendTextMessage = async (
    input_message: string,
    chatroom_id: string,
  ) => {
    clearMessageInput(chatroom_id);
    const messageData = createNewMessage({
      content: input_message,
      is_image: false,
      chatroom_id,
    });
    addNewMessageToChatCache(messageData);
    if (messageData) await sendMessageMutation.mutateAsync(messageData);
  };

  const handleSubmitMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (scrollToStart) scrollToStart();
    if (activeChatroom) {
      const { chatroom_id } = activeChatroom;
      const input_message = inputMessages.get(chatroom_id);
      const input_images = inputImages.get(chatroom_id);

      if (input_message) {
        await sendTextMessage(input_message, chatroom_id);
      }
      if (input_images && input_images.length > 0) {
        await sendImageMessage(chatroom_id);
      }
    }
  };

  const sendImageMessage = async (chatroomId: string) => {
    const input_images = inputImages.get(chatroomId);
    if (!input_images) return;
    const newMessagesStack: TMessage[] = [];
    clearImagesInput(chatroomId);

    for (const fileUrl of input_images) {
      const id = uuidv4();
      const messageData = createNewMessage({
        id,
        chatroom_id: chatroomId,
        content: "",
        is_image: true,
      });
      messageData.content = fileUrl;
      newMessagesStack.push(messageData);
      addNewMessageToChatCache(messageData);
    }

    const { data } = await axios.post("/api/upload/message", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    const newUrls = data.urls as S3UploadResponse[];
    await Promise.all(
      newUrls.map(async (_, id) => {
        const message = newMessagesStack[id];
        message.content = newUrls[id].key;
        await sendMessageMutation.mutateAsync(message);
      }),
    );

    formData.delete("images");
    setTrackFiles([]);
  };

  return {
    handleSubmitMessage,
    fileSetter,
    removeFileFromArray,
    handleSelectEmoji,
  };
};

export default useChat;
