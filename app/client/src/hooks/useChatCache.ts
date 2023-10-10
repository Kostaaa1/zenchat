import { TMessage } from "../../../server/src/types/types";
import { TRecieveNewSocketMessageType } from "../../../server/src/types/sockets";

import { useCallback } from "react";
import getCurrentDate from "../utils/getCurrentDate";
import { trpc } from "../utils/trpcClient";
import useChatStore from "../utils/stores/chatStore";
import useUser from "./useUser";
import { useParams } from "react-router-dom";

const useChatCache = () => {
  const ctx = trpc.useContext();
  const { setTypingUser } = useChatStore();
  const { userId } = useUser();
  const params = useParams<{ chatRoomId: string }>();

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
    ctx.chat.messages.get.setData({ chatroom_id }, (staleChats) => {
      if (staleChats && id) {
        return staleChats.filter((x) => x.id !== id);
      }
    });
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
    (socketData: TRecieveNewSocketMessageType) => {
      const { channel, data } = socketData;

      if (channel === "typing" && params?.chatRoomId === data.chatroom_id) {
        setTypingUser(data.userId);
        return;
      }

      if (channel === "messages-channel") {
        if (Object.keys(data).length === 0) return;
        const { isImage, sender_id } = data;

        if (!isImage) {
          if (sender_id !== userId) {
            addNewMessageToChatCache(data);
            updateUserChatLastMessageCache(data);
          }
        } else {
          sender_id === userId
            ? replacePreviewImage(data)
            : addNewMessageToChatCache(data);
        }
      }
    },
    [addNewMessageToChatCache, updateUserChatLastMessageCache],
  );

  return {
    removeMessageCache,
    recieveNewSocketMessage,
    addNewMessageToChatCache,
  };
};

export default useChatCache;
