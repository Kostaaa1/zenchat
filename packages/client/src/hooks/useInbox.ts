import { useEffect, useMemo, useState } from "react";
import useChatStore from "../stores/chatStore";
import useUser from "./useUser";
import { trpc } from "../lib/trpcClient";
import useChatMapStore from "../stores/chatMapStore";
import { loadImage } from "../utils/image";
import { useParams } from "react-router-dom";

const useInbox = () => {
  const { chatroomId } = useParams<{ chatroomId: string }>();
  const { userData } = useUser();
  const inputImages = useChatMapStore((state) => state.inputImages);
  const inputMessages = useChatMapStore((state) => state.inputMessages);
  const [isUserChatsLoading, setIsUserChatsLoading] = useState<boolean>(true);

  const { setActiveChatroom, setActiveChatroomTitle } = useChatStore(
    (state) => state.actions,
  );

  ////
  const { data } = trpc.chat.get.user_chatrooms.useQuery(userData!.id, {
    enabled: !!userData,
    refetchOnReconnect: "always",
    refetchOnMount: "always",
  });

  const userChats = useMemo(() => {
    const filteredChats = data?.filter((x) =>
      x.users.some((y) => y.username === userData?.username && y.is_active),
    );
    if (filteredChats) {
      filteredChats.forEach(async (chat) => {
        await Promise.all(
          chat.users.map(
            async (user) => user.image_url && (await loadImage(user.image_url)),
          ),
        );
        inputMessages.set(chat.chatroom_id, "");
        inputImages.set(chat.chatroom_id, []);
      });
    }
    return filteredChats;
  }, [data]);

  useEffect(() => {
    if (!userChats || userChats.length === 0 || !userData) return;
    const activeChat = userChats.find(
      (chat) => chat.chatroom_id === chatroomId,
    );
    if (activeChat) {
      setActiveChatroom(activeChat);
      setActiveChatroomTitle(
        activeChat.users
          .filter((chat) => chat.username !== userData.username)
          .map((chat) => chat.username)
          .join(", "),
      );
    }
    setIsUserChatsLoading(false);
  }, [userChats, chatroomId, userData]);

  return {
    userChats,
    isUserChatsLoading,
  };
};

export default useInbox;
