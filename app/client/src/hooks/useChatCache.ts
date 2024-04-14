import { TMessage } from "../../../server/src/types/types";
import { TRecieveNewSocketMessageType } from "../../../server/src/types/sockets";

import { useCallback } from "react";
import getCurrentDate from "../utils/getCurrentDate";
import { trpc } from "../utils/trpcClient";
import useChatStore from "../utils/stores/chatStore";
import useUser from "./useUser";
import { useNavigate, useParams } from "react-router-dom";

const useChatCache = () => {
  const ctx = trpc.useUtils();
  const { setTypingUser, setCurrentChatroom } = useChatStore(
    (state) => state.actions,
  );
  const { userId } = useUser();
  const params = useParams<{ chatRoomId: string }>();
  const navigate = useNavigate();

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

  const removeChatFromUserChats = (chatroom_id: string) => {
    ctx.chat.get.user_chatrooms.setData(userId, (state) => {
      return state?.filter((x) => x.chatroom_id !== chatroom_id);
    });

    setCurrentChatroom(null);
    navigate("/inbox");
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
      console.log("Message from socket: ", msg);
      const last_message = msg.isImage
        ? "Photo"
        : msg.content.length > 40
          ? msg.content.slice(0, 40) + "..."
          : msg.content;

      ctx.chat.get.user_chatrooms.setData(userId, (oldData) => {
        const data = oldData
          ?.map((chat) =>
            chat.chatroom_id === msg.chatroom_id
              ? {
                  ...chat,
                  last_message,
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
    [ctx.chat.get.user_chatrooms, userId],
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
          }
        } else {
          sender_id === userId
            ? replacePreviewImage(data)
            : addNewMessageToChatCache(data);
        }
        updateUserChatLastMessageCache(data);
      }
    },
    [addNewMessageToChatCache, updateUserChatLastMessageCache],
  );

  return {
    removeChatFromUserChats,
    removeMessageCache,
    recieveNewSocketMessage,
    addNewMessageToChatCache,
  };
};

export default useChatCache;
