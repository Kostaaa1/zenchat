import { FC } from "react";
import { TChatroom } from "../../../server/src/types/types";
import List from "./List";
import { cn } from "../utils/utils";
import useUser from "../hooks/useUser";
import useChatStore from "../utils/state/chatStore";
import { useNavigate, useParams } from "react-router-dom";

type ChatListProps = {
  chat: TChatroom;
};

const ChatList: FC<ChatListProps> = ({ chat }) => {
  const { userData } = useUser();
  const { setIsMessagesLoading, setShowDetails } = useChatStore(
    (state) => state.actions,
  );
  const navigate = useNavigate();
  const params = useParams<{ chatRoomId: string }>();

  const handleChatUserClick = (chatroom_id: string) => {
    if (params.chatRoomId === chatroom_id) return;
    setIsMessagesLoading(true);
    // setShouldFetchMoreMessages(true);
    setShowDetails(false);
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
      subtitle={chat.last_message}
      // isRead={chat.is_read}
      onClick={() => handleChatUserClick(chat.chatroom_id)}
      isActive={
        chat.users.filter((x) => x.username !== userData?.username)[0]
          .is_socket_active && !chat.is_group
      }
      className={cn(
        params.chatRoomId === chat.chatroom_id && "bg-white bg-opacity-10",
      )}
      image_url={
        chat.is_group && chat.users.length > 1
          ? [chat.users[0].image_url, chat.users[1].image_url]
          : [chat.users.find((x) => x.user_id !== userData?.id)?.image_url]
      }
    />
  );
};

export default ChatList;
