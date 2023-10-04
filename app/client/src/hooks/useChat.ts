import { TMessage } from "../../../server/src/types/types";
import { useCallback } from "react";
import getCurrentDate from "../utils/getCurrentDate";
import { trpc } from "../utils/trpcClient";
import useChatStore from "../utils/stores/chatStore";
import useStore from "../utils/stores/store";

const useChat = () => {
  const { userId } = useStore();
  const ctx = trpc.useContext();
  const { setTypingUser } = useChatStore();

  const addNewMessageToChatCache = useCallback(
    (messageData: TMessage) => {
      ctx.chat.messages.get.setData(
        {
          chatroom_id: messageData.chatroom_id,
        },
        (staleChats) => {
          if (staleChats && messageData) {
            return [messageData, ...staleChats];
          }
        },
      );
    },
    [ctx.chat.messages.get],
  );

  // Cache Mutation functions: //
  const removeMessageCache = (id: string, chatroom_id: string) => {
    console.log(id);
    ctx.chat.messages.get.setData({ chatroom_id }, (staleChats) => {
      if (staleChats && id) {
        return staleChats.filter((x) => x.id !== id);
      }
    });
  };

  const handleTyping = (data: string) => {
    setTypingUser(data);
  };

  const replacePreviewImage = useCallback(
    (messageData: TMessage) => {
      ctx.chat.messages.get.setData(
        {
          chatroom_id: messageData.chatroom_id,
        },
        (staleChats) => {
          if (messageData && staleChats) {
            return staleChats?.map((x) =>
              x.isImage && x.id === messageData.id ? messageData : x,
            );
          }
        },
      );
    },
    [ctx.chat.messages.get],
  );

  const updateUserChatLastMessageCache = useCallback(
    (msg: TMessage) => {
      console.log("SKRT CALLEDDDSDASKODKasok", msg);
      const lastmessage = msg.isImage
        ? "Photo"
        : msg.content.length > 40
        ? msg.content.slice(0, 40) + "..."
        : msg.content;

      ctx.chat.getCurrentChatRooms.setData(userId, (oldData) => {
        const data = oldData
          ?.map((chat) =>
            chat.chatroom_id === msg.chatroom_id
              ? {
                  ...chat,
                  last_message: lastmessage,
                  created_at: getCurrentDate(),
                }
              : chat,
          )
          .sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();

            return dateB - dateA;
          });

        return data;
      });
    },
    [ctx.chat.getCurrentChatRooms, userId],
  );

  const recieveNewSocketMessage = useCallback(
    (messageData: TMessage) => {
      console.log("recieved from socket", messageData);
      if (!messageData) {
        console.log("NO MESSAGE DATA FROM SOCKEt");
        console.log(Object.keys(messageData).length === 0);
      }
      if (Object.keys(messageData).length === 0) return;
      const { isImage, sender_id } = messageData;

      if (!isImage) {
        if (sender_id !== userId) {
          addNewMessageToChatCache(messageData);
          updateUserChatLastMessageCache(messageData);
        }
      } else {
        sender_id === userId
          ? replacePreviewImage(messageData)
          : addNewMessageToChatCache(messageData);
      }
    },
    [addNewMessageToChatCache, updateUserChatLastMessageCache],
  );

  return {
    // isUserChatsLoading,
    // userChats,
    handleTyping,
    removeMessageCache,
    recieveNewSocketMessage,
    addNewMessageToChatCache,
  };
};

export default useChat;
