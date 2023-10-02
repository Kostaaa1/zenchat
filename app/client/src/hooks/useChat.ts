import { TMessage } from "../../../server/src/types/types";
import { useCallback, useEffect, useState } from "react";
import getCurrentDate from "../utils/getCurrentDate";
import { trpc } from "../utils/trpcClient";
import { useParams } from "react-router-dom";
import useChatStore from "../utils/stores/chatStore";
import { loadImages } from "../utils/loadImages";
import useStore from "../utils/stores/store";

const useChat = (chatRoomId: string) => {
  const { userId } = useStore();
  const ctx = trpc.useContext();
  const params = useParams();
  const { setCurrentChatroom } = useChatStore();
  const [shouldFetchMore, setShouldFetchMore] = useState<boolean>(true);
  const [lastMessageDate, setLastMessageDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const { data: userChats, isLoading: isUserChatsLoading } =
    trpc.chat.getCurrentChatRooms.useQuery(userId, {
      enabled: !!userId,
    });

  useEffect(() => {
    if (userChats) {
      const chatRoomData = userChats?.find(
        (chat) => chat.chatroom_id === params.chatRoomId,
      );
      if (chatRoomData) setCurrentChatroom(chatRoomData);
    }
  }, [userChats, params.chatRoomId, setCurrentChatroom]);

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

  // const { data: messages } = trpc.chat.messages.get.useQuery(
  //   {
  //     chatroom_id: chatRoomId as string,
  //   },
  //   {
  //     enabled: !!chatRoomId,
  //   },
  // );

  // useEffect(() => {
  //   if (messages) {
  //     if (messages.length <= 22) {
  //       setShouldFetchMore(false);
  //     }
  //     const fetchImages = async () => {
  //       try {
  //         const loadedImages = await loadImages(messages);
  //         ctx.chat.messages.get.setData(
  //           {
  //             chatroom_id: chatRoomId as string,
  //           },
  //           loadedImages as TMessage[],
  //         );
  //       } catch (error) {
  //         console.log(error);
  //       } finally {
  //         setLoading(false);
  //       }
  //     };
  //     fetchImages();
  //   }
  // }, [messages]);

  // useEffect(() => {
  //   if (messages && messages.length > 0) {
  //     setLastMessageDate(messages?.[messages.length - 1].created_at);
  //   }
  // }, [messages]);

  // const { mutateAsync: getMoreMutation, isSuccess } =
  //   trpc.chat.messages.getMore.useMutation({
  //     mutationKey: [
  //       {
  //         chatroom_id: chatRoomId as string,
  //       },
  //     ],
  //     onSuccess: (messages) => {
  //       if (!messages) return;
  //       console.log("Fetched messages", messages);
  //       if (!shouldFetchMore) return;

  //       ctx.chat.messages.get.setData(
  //         {
  //           chatroom_id: chatRoomId,
  //         },
  //         (staleChats) => {
  //           if (staleChats && messages) {
  //             return [...staleChats, ...messages];
  //           }
  //         },
  //       );

  //       if (messages.length <= 22) {
  //         setShouldFetchMore(false);
  //       }
  //     },
  //   });

  // Cache Mutation functions: //
  const removeMessageCache = (id: string, chatroomId: string) => {
    ctx.chat.messages.get.setData(
      {
        chatroom_id: chatroomId,
      },
      (staleChats) => {
        if (staleChats && id) {
          console.log(id, staleChats);
          return staleChats.filter((x) => x.id !== id);
        }
      },
    );
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
      const { isImage, sender_id } = messageData;

      if (!isImage) {
        if (sender_id !== userId) {
          addNewMessageToChatCache(messageData);
        }
      } else {
        sender_id === userId
          ? replacePreviewImage(messageData)
          : addNewMessageToChatCache(messageData);
      }
      updateUserChatLastMessageCache(messageData);
    },
    [addNewMessageToChatCache, updateUserChatLastMessageCache],
  );

  return {
    shouldFetchMore,
    userChats,
    isUserChatsLoading,
    // messages,
    // isSuccess,
    removeMessageCache,
    loading,
    // getMoreMutation,
    recieveNewSocketMessage,
    addNewMessageToChatCache,
    lastMessageDate,
  };
};

export default useChat;
