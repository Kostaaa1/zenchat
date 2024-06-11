import { FC } from "react";
import { TChatroom } from "../../../server/src/types/types";
import List from "./List";
import { cn } from "../utils/utils";
import useUser from "../hooks/useUser";
import useChatStore from "../lib/stores/chatStore";
import { useNavigate, useParams } from "react-router-dom";
import useGeneralStore from "../lib/stores/generalStore";

type ChatListProps = {
  chat: TChatroom;
};

const ChatList: FC<ChatListProps> = ({ chat }) => {
  const { userData } = useUser();
  const {
    setShouldFetchMoreMessages,
    setMessages,
    setShowDetails,
    setIsChatLoading,
    setActiveChatroom,
  } = useChatStore((state) => state.actions);
  const navigate = useNavigate();
  const params = useParams<{ chatRoomId: string }>();
  const { is_group, chatroom_id, last_message, users } = chat;
  const isMobile = useGeneralStore((state) => state.isMobile);

  const handleChatUserClick = (chatroom_id: string) => {
    if (params.chatRoomId === chatroom_id) return;
    setShouldFetchMoreMessages(true);
    setShowDetails(false);
    setIsChatLoading(true);
    setActiveChatroom(null);
    setMessages([]);
    navigate(`/inbox/${chatroom_id}`);
  };

  const chatTitle = chat.users
    .filter((x) => x.username !== userData?.username)
    .map((x) => x.username)
    .join(", ");

  return (
    <List
      isHoverDisabled={true}
      hover="darker"
      title={chatTitle}
      subtitle={last_message}
      isRead={users.find((x) => x.user_id === userData?.id)?.is_message_seen}
      onClick={() => handleChatUserClick(chatroom_id)}
      padding={isMobile ? "md" : "lg"}
      isActive={
        users.filter((x) => x.username !== userData?.username)[0]
          .is_socket_active && !is_group
      }
      className={cn(
        params.chatRoomId === chatroom_id && "bg-white bg-opacity-10",
      )}
      image_url={
        is_group && users.length > 1
          ? [users[0].image_url, users[1].image_url]
          : [users.find((x) => x.user_id !== userData?.id)?.image_url]
      }
    />
  );
};

export default ChatList;
