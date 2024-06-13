import { FC } from "react";
import { TChatroom } from "../../../../../server/src/types/types";
import Icon from "../../../components/Icon";
import List from "../../../components/List";
import useModalStore from "../../../lib/stores/modalStore";
import useUser from "../../../hooks/useUser";
import { cn } from "../../../utils/utils";
import useGeneralStore from "../../../lib/stores/generalStore";
import useChatStore from "../../../lib/stores/chatStore";
import { useNavigate, useParams } from "react-router-dom";

type TUserChatsProps = {
  userChats: TChatroom[] | undefined;
  isLoading: boolean;
};

const UserChats: FC<TUserChatsProps> = ({ userChats, isLoading }) => {
  const { userData } = useUser();
  const { openModal } = useModalStore((state) => state.actions);
  const navigate = useNavigate();
  const params = useParams<{ chatRoomId: string }>();
  const isMobile = useGeneralStore((state) => state.isMobile);
  const {
    setShouldFetchMoreMessages,
    setMessages,
    setShowDetails,
    setIsChatLoading,
    setActiveChatroom,
  } = useChatStore((state) => state.actions);

  const handleChatUserClick = (chatroom_id: string) => {
    if (params.chatRoomId === chatroom_id) return;
    setShouldFetchMoreMessages(true);
    setShowDetails(false);
    setIsChatLoading(true);
    setActiveChatroom(null);
    setMessages([]);
    navigate(`/inbox/${chatroom_id}`);
  };

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col border-r border-[#262626] bg-black",
        isMobile ? "" : "max-w-sm",
      )}
    >
      <div
        className={cn(
          "flex h-full max-h-[90px] items-center justify-between border-b border-[#262626]",
          isMobile ? "h-[70px] p-4" : "h-full p-6",
        )}
      >
        <div className="flex cursor-pointer items-center active:text-zinc-500">
          <h1 className="mr-1 text-xl font-bold"> {userData?.username} </h1>
          <Icon name="ChevronDown" size="20px" />
        </div>
        <Icon
          name="PenSquare"
          size="22px"
          onClick={() => openModal("newmessage")}
          className="active:text-zinc-500"
        />
      </div>
      <ul className="h-full overflow-y-auto">
        {userChats?.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-neutral-400">No messages found.</p>
          </div>
        ) : (
          <>
            {isLoading ? (
              Array(2)
                .fill("")
                .map((_, id) => (
                  <List
                    key={id}
                    padding={isMobile ? "md" : "lg"}
                    isLoading={isLoading}
                  />
                ))
            ) : (
              <>
                {userChats?.map((chat) => (
                  <List
                    isHoverDisabled={true}
                    hover="darker"
                    subtitle={chat.last_message}
                    padding={isMobile ? "md" : "lg"}
                    isLoading={isLoading}
                    onClick={() => handleChatUserClick(chat.chatroom_id)}
                    title={chat.users
                      .filter((x) => x.username !== userData?.username)
                      .map((x) => x.username)
                      .join(", ")}
                    isRead={
                      chat.users.find((x) => x.user_id === userData?.id)
                        ?.is_message_seen
                    }
                    isOnline={
                      chat.users.filter(
                        (x) => x.username !== userData?.username,
                      )[0].is_socket_active && !chat.is_group
                    }
                    className={cn(
                      "h-20",
                      params.chatRoomId === chat.chatroom_id &&
                        "bg-white bg-opacity-10",
                    )}
                    image_url={
                      chat.is_group && chat.users.length > 1
                        ? [chat.users[0].image_url, chat.users[1].image_url]
                        : [
                            chat.users.find((x) => x.user_id !== userData?.id)
                              ?.image_url,
                          ]
                    }
                  />
                ))}
              </>
            )}
          </>
        )}
      </ul>
    </div>
  );
};

export default UserChats;
