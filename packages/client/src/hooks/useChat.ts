import { useCallback, useEffect } from "react";
import useChatStore from "../lib/stores/chatStore";
import { TMessage } from "../../../server/src/types/types";
import { trpc } from "../lib/trpcClient";
import { loadImage } from "../utils/image";
import { useParams } from "react-router-dom";
import useChatCache from "./useChatCache";
import useUser from "./useUser";

const useChat = () => {
  const MESSAGE_FETCH_LIMIT = 22;
  const utils = trpc.useUtils();
  const { updateUserReadMessage } = useChatCache();
  const { userData } = useUser();
  const { chatRoomId } = useParams<{ chatRoomId: string }>();
  const { activeChatroom } = useChatStore((state) => ({
    activeChatroom: state.activeChatroom,
  }));
  const { setLastMessageDate, setActiveChatroom, setIsMessagesLoading } =
    useChatStore((state) => state.actions);

  const { data: messages, isLoading } = trpc.chat.messages.get.useQuery(
    { chatroom_id: chatRoomId! },
    { enabled: !!activeChatroom && !!chatRoomId },
  );

  const loadMessages = useCallback(
    async (messages: TMessage[]) => {
      await Promise.all(
        messages.map(async (msg) => {
          if (msg.is_image) await loadImage(msg.content);
        }),
      );
      setIsMessagesLoading(false);
    },
    [setIsMessagesLoading],
  );

  useEffect(() => {
    if (!isLoading && messages) {
      messages.length === 0
        ? setIsMessagesLoading(false)
        : loadMessages(messages);
    }
  }, [isLoading, messages]);

  const { shouldFetchMoreMessages } = useChatStore((state) => ({
    shouldFetchMoreMessages: state.shouldFetchMoreMessages,
  }));

  const {
    decrementUnreadMessagesCount,
    setShouldFetchMoreMessages,
    setShowDetails,
  } = useChatStore((state) => state.actions);

  const triggerReadMessagesMutation =
    trpc.chat.messages.triggerReadMessages.useMutation({
      onSuccess: () => {
        if (activeChatroom) {
          decrementUnreadMessagesCount();
          updateUserReadMessage(activeChatroom.chatroom_id, true);
        }
      },
      onError: (err) => {
        console.log("error", err);
      },
    });

  useEffect(() => {
    if (activeChatroom && userData) {
      const foundUser = activeChatroom.users.find(
        (x) => x.user_id === userData.id,
      );
      if (foundUser && !foundUser.is_message_seen) {
        console.log("Should trigger");
        triggerReadMessagesMutation.mutate(foundUser.id);
      }
    }
  }, [activeChatroom, triggerReadMessagesMutation, userData]);

  const { mutateAsync: getMoreMutation } =
    trpc.chat.messages.getMore.useMutation({
      mutationKey: [
        {
          chatroom_id: activeChatroom?.chatroom_id,
        },
      ],
      onSuccess: (messages) => {
        if (!messages || !shouldFetchMoreMessages || !activeChatroom) return;
        utils.chat.messages.get.setData(
          {
            chatroom_id: activeChatroom.chatroom_id,
          },
          (staleChats) => {
            if (staleChats && messages) return [...staleChats, ...messages];
          },
        );
        if (messages.length < MESSAGE_FETCH_LIMIT) {
          setShouldFetchMoreMessages(false);
        }
      },
    });

  useEffect(() => {
    if (!messages) return;
    console.log("messages ran");
    if (messages.length === 0 || messages.length < MESSAGE_FETCH_LIMIT) {
      setShouldFetchMoreMessages(false);
      return;
    }
    if (messages.length > 0) {
      setLastMessageDate(messages[messages.length - 1].created_at);
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      setActiveChatroom(null);
      setShowDetails(false);
    };
  }, []);

  return {
    messages,
    getMoreMutation,
  };
};

export default useChat;
