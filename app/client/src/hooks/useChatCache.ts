import { TMessage } from "../../../server/src/types/types";
import { TRecieveNewSocketMessageType } from "../../../server/src/types/sockets";
import { useCallback } from "react";
import getCurrentDate from "../utils/getCurrentDate";
import { trpc } from "../utils/trpcClient";
import useChatStore from "../utils/state/chatStore";
import useUser from "./useUser";
import { useNavigate } from "react-router-dom";
import { loadImage } from "../utils/utils";

const useChatCache = () => {
  const ctx = trpc.useUtils();
  const { setCurrentChatroom } = useChatStore((state) => state.actions);
  const { userData } = useUser();
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

  const removeMessageCache = (id: string, chatroom_id: string) => {
    ctx.chat.messages.get.setData({ chatroom_id }, (staleChats) => {
      if (staleChats && id) {
        return staleChats.filter((x) => x.id !== id);
      }
    });
  };

  const removeChatFromUserChats = (chatroom_id: string) => {
    ctx.chat.get.user_chatrooms.setData(userData!.id, (state) => {
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
              x.is_image && x.id === messageData.id ? messageData : x,
            );
          }
        },
      );
    },
    [ctx.chat.messages.get],
  );

  const updateUserChatLastMessageCache = useCallback(
    (msg: TMessage) => {
      ctx.chat.get.user_chatrooms.refetch(userData!.id);
      const last_message = msg.is_image
        ? "Photo"
        : msg.content.length > 38
        ? msg.content.slice(0, 38) + "..."
        : msg.content;

      ctx.chat.get.user_chatrooms.setData(userData!.id, (oldData) => {
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
    [ctx.chat.get.user_chatrooms, userData],
  );

  const recieveNewSocketMessage = useCallback(
    async (socketData: TRecieveNewSocketMessageType) => {
      const { channel, data } = socketData;
      if (channel === "onMessage") {
        // await ctx.chat.messages.get.refetch({
        //   chatroom_id: data.message.chatroom_id,
        // });
        // await ctx.chat.get.user_chatrooms.refetch(userData!.id)
        const { message, shouldActivate, user_id } = data;
        if (message.is_image) await loadImage(message.content);
        if (shouldActivate) {
          await ctx.chat.get.user_chatrooms.refetch(user_id);
          return;
        }

        updateUserChatLastMessageCache(message);
        const { is_image, sender_id } = message;
        if (!is_image) {
          if (sender_id !== userData!.id) addNewMessageToChatCache(message);
        } else {
          sender_id === userData!.id
            ? replacePreviewImage(message)
            : addNewMessageToChatCache(message);
        }
      }
    },
    [addNewMessageToChatCache, updateUserChatLastMessageCache, userData],
  );

  return {
    removeChatFromUserChats,
    removeMessageCache,
    recieveNewSocketMessage,
    addNewMessageToChatCache,
  };
};

export default useChatCache;
