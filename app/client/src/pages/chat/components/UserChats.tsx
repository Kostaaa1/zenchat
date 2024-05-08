import { FC } from "react";
import { TChatroom } from "../../../../../server/src/types/types";
import Icon from "../../../components/Icon";
import List from "../../../components/List";
import useModalStore from "../../../utils/state/modalStore";
import useUser from "../../../hooks/useUser";
import ChatList from "../../../components/ChatList";
import { cn } from "../../../utils/utils";

type TUserChatsProps = {
  userChats: TChatroom[] | undefined;
  isLoading: boolean;
};

const UserChats: FC<TUserChatsProps> = ({ userChats, isLoading }) => {
  const { userData } = useUser();
  const { setIsNewMessageModalModalOpen } = useModalStore(
    (state) => state.actions,
  );

  return (
    <div
      className={cn(
        "flex h-full w-full max-w-sm flex-col border-r border-[#262626] bg-black",
      )}
    >
      <div className="flex h-full max-h-[90px] items-center justify-between border-b border-[#262626] p-6">
        <div className="flex cursor-pointer items-center active:text-zinc-500">
          <h1 className="mr-1 text-xl font-bold"> {userData?.username} </h1>
          <Icon name="ChevronDown" size="20px" />
        </div>
        <Icon
          name="PenSquare"
          size="22px"
          onClick={() => setIsNewMessageModalModalOpen(true)}
          className="active:text-zinc-500"
        />
      </div>
      <ul className="h-full overflow-y-auto">
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
              <ChatList key={chat.chatroom_id} chat={chat} />
            ))}
          </>
        )}
      </ul>
    </div>
  );
};

export default UserChats;
