import { useUser } from "@clerk/clerk-react";
import { useNavigate, useParams } from "react-router-dom";
import { FC, useEffect } from "react";
import { TChatRoomData } from "../../../../../server/src/types/types";
import Icon from "../../main/components/Icon";
import ChatList from "../../../components/ChatList";
import useChatStore from "../../../utils/stores/chatStore";
import { trpc } from "../../../utils/trpcClient";
import useModalStore from "../../../utils/stores/modalStore";

type TUserChatsProps = {
  userChats: TChatRoomData[] | undefined;
  isLoading: boolean;
};

const UserChats: FC<TUserChatsProps> = ({ userChats, isLoading }) => {
  const { user } = useUser();
  const { setIsMessagesLoading, setShouldFetchMoreMessages } = useChatStore();
  const navigate = useNavigate();
  const params = useParams<{ chatRoomId: string }>();
  const { chatRoomId } = params;
  const ctx = trpc.useContext();
  const { setIsSendMessageModalActive } = useModalStore();

  const handleChatUserClick = (chatroom_id: string) => {
    if (chatRoomId === chatroom_id) return;

    // const data = ctx.chat.messages.get
    //   .getData({ chatroom_id })
    //   ?.find((x) => x.chatroom_id === chatroom_id);

    // if (!data) {
    setIsMessagesLoading(true);
    setShouldFetchMoreMessages(true);
    // }

    navigate(`/inbox/${chatroom_id}`);
  };

  return (
    <div className="flex h-full w-full max-w-[400px] flex-col border-r border-[#262626] bg-black">
      <div className="flex h-full max-h-[90px] items-center justify-between border-b border-[#262626] p-6">
        <div className="flex cursor-pointer items-center active:text-zinc-500">
          <h1 className="mr-1 text-2xl font-bold"> {user?.username} </h1>
          <Icon name="ChevronDown" size="20px" />
        </div>
        <Icon
          name="PenSquare"
          size="28px"
          onClick={() => setIsSendMessageModalActive(true)}
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
            .map((_, id) => (
              <div
                key={id}
                className="relative flex w-full cursor-pointer items-center justify-between px-6 py-2"
              >
                <div className="flex h-16 w-full animate-pulse items-center">
                  <div className="h-full w-16 overflow-hidden rounded-full bg-neutral-800"></div>
                  <div className="ml-4 flex h-full flex-col justify-center">
                    <div className="mb-3 h-4 w-[240px] rounded-lg bg-neutral-800"></div>
                    <div className="h-4 w-[80px] rounded-lg bg-neutral-800"></div>
                  </div>
                </div>
              </div>
            ))
        ) : (
          <>
            {userChats?.map((chat) => (
              <ChatList
                key={chat.id}
                isHoverDisabled={true}
                image_url={chat.image_url}
                hover="darker"
                title={chat.username}
                subtitle={chat.last_message}
                avatarSize="lg"
                onClick={() => handleChatUserClick(chat.chatroom_id)}
                className={
                  chatRoomId === chat.chatroom_id
                    ? "bg-white bg-opacity-10"
                    : ""
                }
              />
            ))}
          </>
        )}
      </ul>
    </div>
  );
};

export default UserChats;
