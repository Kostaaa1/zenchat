import { useCallback, useEffect } from "react";
import useUser from "./useUser";
import useChatStore from "../lib/stores/chatStore";
import { socket } from "../lib/socket";
import { TMessage } from "../../../server/src/types/types";
import { trpc } from "../lib/trpcClient";
import { getCurrentDate } from "../utils/date";
import { TRecieveNewSocketMessageType } from "../../../server/src/types/sockets";
import { loadImage } from "../utils/image";
import { toast } from "react-toastify";

const useChatSocket = () => {
  const utils = trpc.useUtils();
  const activeChatroom = useChatStore((state) => state.activeChatroom);
  const { userData } = useUser();

  const addNewMessageToChatCache = useCallback(
    (messageData: TMessage) => {
      utils.chat.messages.get.setData(
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
    [utils.chat.messages.get],
  );

  const replacePreviewImage = useCallback(
    (messageData: TMessage) => {
      utils.chat.messages.get.setData(
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
    [utils.chat.messages.get],
  );

  const updateUserChatLastMessageCache = useCallback(
    (msg: TMessage) => {
      if (!userData) return;
      const { content, chatroom_id } = msg;

      utils.chat.get.user_chatrooms.setData(userData?.id, (state) => {
        const data = state
          ?.map((chat) =>
            chat.chatroom_id === chatroom_id
              ? {
                  ...chat,
                  last_message: content,
                  created_at: getCurrentDate(),
                  users:
                    activeChatroom?.chatroom_id === chat.chatroom_id
                      ? chat.users
                      : chat.users.map((participant) => {
                          return participant.user_id === userData?.id
                            ? { ...participant, is_message_seen: false }
                            : participant;
                        }),
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
    [utils.chat.get.user_chatrooms, userData, activeChatroom],
  );

  const recieveNewSocketMessage = useCallback(
    async (socketData: TRecieveNewSocketMessageType) => {
      if (!userData) return;
      console.log("Recieve new socket message called", socketData);
      const { channel, data } = socketData;
      if (channel === "onMessage") {
        const { message, shouldActivate } = data;
        const { is_image, sender_id } = message;
        if (is_image) await loadImage(message.content);

        if (shouldActivate) {
          console.log("The chat is inactive, need to refetch");
          ////////////////////////////////////////////////////
          await utils.chat.get.user_chatrooms.invalidate(userData.id);
          await utils.chat.get.user_chatrooms.refetch(userData.id);
          ////////////////////////////////////////////////////
        }
        updateUserChatLastMessageCache(message);

        const isLoggedUserSender = sender_id === userData?.id;
        if (!isLoggedUserSender) {
          // incrementUnreadMessagesCount();
          if (!activeChatroom && !location.pathname.includes("/inbox")) {
            toast(`${message.sender_username}: ${message.content}`);
          }
        }
        if (!is_image) {
          if (!isLoggedUserSender) addNewMessageToChatCache(message);
        } else {
          isLoggedUserSender
            ? replacePreviewImage(message)
            : addNewMessageToChatCache(message);
        }
      }
    },
    [
      activeChatroom,
      addNewMessageToChatCache,
      replacePreviewImage,
      updateUserChatLastMessageCache,
      userData,
    ],
  );

  useEffect(() => {
    if (!userData) return;
    socket.emit("join-room", userData.id);
    socket.emit("onMessage", userData.id);
    socket.on("onMessage", recieveNewSocketMessage);

    const cleanup = () => {
      socket.off("join-room", recieveNewSocketMessage);
      socket.off("onMessage", recieveNewSocketMessage);
      socket.off("disconnect", () => {
        console.log("Disconnected from socket");
      });
    };

    return cleanup;
  }, [userData, activeChatroom, recieveNewSocketMessage]);
};

export default useChatSocket;
