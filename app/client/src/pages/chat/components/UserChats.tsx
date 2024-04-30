import { useNavigate, useParams } from "react-router-dom";
import { FC } from "react";
import { TChatroom } from "../../../../../server/src/types/types";
import Icon from "../../main/components/Icon";
import List from "../../../components/List";
import useChatStore from "../../../utils/stores/chatStore";
import useModalStore from "../../../utils/stores/modalStore";
import useUser from "../../../hooks/useUser";
import { cn } from "../../../utils/utils";

type TUserChatsProps = {
  userChats: TChatroom[] | undefined;
  isLoading: boolean;
};

const UserChats: FC<TUserChatsProps> = ({ userChats, isLoading }) => {
  const { userData } = useUser();
  const { setIsMessagesLoading, setShowDetails, setShouldFetchMoreMessages } =
    useChatStore((state) => state.actions);
  const navigate = useNavigate();
  const params = useParams<{ chatRoomId: string }>();
  const { chatRoomId } = params;
  const { setIsNewMessageModalModalOpen } = useModalStore(
    (state) => state.actions,
  );

  const handleChatUserClick = (chatroom_id: string) => {
    if (chatRoomId === chatroom_id) return;
    setIsMessagesLoading(true);
    setShouldFetchMoreMessages(true);
    setShowDetails(false);
    navigate(`/inbox/${chatroom_id}`);
  };

  return (
    <div className="flex h-full w-full max-w-[400px] flex-col border-r border-[#262626] bg-black">
      <div className="flex h-full max-h-[90px] items-center justify-between border-b border-[#262626] p-6">
        <div className="flex cursor-pointer items-center active:text-zinc-500">
          <h1 className="mr-1 text-2xl font-bold"> {userData?.username} </h1>
          <Icon name="ChevronDown" size="20px" />
        </div>
        <Icon
          name="PenSquare"
          size="28px"
          onClick={() => setIsNewMessageModalModalOpen(true)}
          className="active:text-zinc-500"
        />
      </div>
      <ul className="scrollbar-colored h-full overflow-y-auto">
        {userChats?.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-neutral-400">No messages found.</p>
          </div>
        ) : null}
        {isLoading ? (
          Array(2)
            .fill("")
            .map((_, id) => <List key={id} isLoading={isLoading} />)
        ) : (
          <>
            {userChats?.map((chat) => (
              <List
                key={chat.id}
                isHoverDisabled={true}
                hover="darker"
                title={chat.users
                  .filter((x) => x.username !== userData?.username)
                  .map((x) => x.username)
                  .join(", ")}
                subtitle={chat.last_message}
                image_url={
                  chat.is_group && chat.users.length > 1
                    ? [chat.users[0].image_url, chat.users[1].image_url]
                    : [
                        chat.users.find((x) => x.user_id !== userData?.id)
                          ?.image_url,
                      ]
                }
                className={cn(
                  chatRoomId === chat.chatroom_id && "bg-white bg-opacity-10",
                )}
                onClick={() => handleChatUserClick(chat.chatroom_id)}
                isRead={chat.is_read}
              />
            ))}
          </>
        )}
      </ul>
    </div>
  );
};

export default UserChats;
