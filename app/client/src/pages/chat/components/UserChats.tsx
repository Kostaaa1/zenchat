import { useNavigate, useParams } from "react-router-dom";
import { FC } from "react";
import { TChatroom } from "../../../../../server/src/types/types";
import Icon from "../../main/components/Icon";
import List from "../../../components/List";
import useChatStore from "../../../utils/stores/chatStore";
import useModalStore from "../../../utils/stores/modalStore";
import useUser from "../../../hooks/useUser";

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
  const { setIsCreateGroupChatModalOpen } = useModalStore(
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
          onClick={() => setIsCreateGroupChatModalOpen(true)}
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
              // <div
              //   key={id}
              //   className="relative flex w-full cursor-pointer items-center justify-between px-6 py-2"
              // >
              //   <div className="flex h-14 w-full animate-pulse items-center">
              //     <div className="h-full w-14 overflow-hidden rounded-full bg-neutral-800"></div>
              //     <div className="ml-4 flex h-full flex-col justify-center">
              //       <div className="mb-3 h-4 w-[240px] rounded-lg bg-neutral-800"></div>
              //       <div className="h-4 w-[80px] rounded-lg bg-neutral-800"></div>
              //     </div>
              //   </div>
              // </div>
              <List key={id} isLoading={isLoading} />
            ))
        ) : (
          <>
            {userChats?.map((chat) => (
              <List
                key={chat.id}
                isHoverDisabled={true}
                hover="darker"
                title={chat.users.map((x) => x.username).join(", ")}
                subtitle={chat.last_message}
                onClick={() => handleChatUserClick(chat.chatroom_id)}
                image_url={
                  chat.is_group && chat.users.length > 1
                    ? [chat.users[0].image_url, chat.users[1].image_url]
                    : [chat.users[0].image_url]
                }
                className={
                  chatRoomId === chat.chatroom_id
                    ? "bg-white bg-opacity-10"
                    : ""
                }
              />
            ))}
          </>
        )}
        {/* {!isLoading && (
          <>
            {userChats?.map((chat) => (
              <List
                key={chat.id}
                isHoverDisabled={true}
                hover="darker"
                title={chat.users.map((x) => x.username).join(", ")}
                subtitle={chat.last_message}
                onClick={() => handleChatUserClick(chat.chatroom_id)}
                image_url={
                  chat.is_group && chat.users.length > 1
                    ? [chat.users[0].image_url, chat.users[1].image_url]
                    : [chat.users[0].image_url]
                }
                className={
                  chatRoomId === chat.chatroom_id
                    ? "bg-white bg-opacity-10"
                    : ""
                }
              />
            ))}
          </>
        )} */}
      </ul>
    </div>
  );
};

export default UserChats;
