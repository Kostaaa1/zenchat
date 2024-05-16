import { FC, useState } from "react";
import List from "../../../components/List";
import { Link } from "react-router-dom";
import { cn } from "../../../utils/utils";
import useModalStore from "../../../utils/state/modalStore";
import useChatStore from "../../../utils/state/chatStore";
import useUser from "../../../hooks/useUser";

interface ChatDetailsProps {}

const ChatDetails: FC<ChatDetailsProps> = () => {
  const currentChatroom = useChatStore((state) => state.currentChatroom);
  const [isMuteActive, setIsMuteActive] = useState<boolean>(false);
  const { openModal } = useModalStore((state) => state.actions);
  const { userData } = useUser();
  const componentLists = [
    { list: "Delete", id: 0, fn: () => openModal("deletechat") },
  ];

  return (
    <div className="flex w-full max-w-[270px] flex-col border border-y-0 border-r-0 border-l-[#262626] ">
      <div className="flex h-full max-h-[140px] flex-col justify-evenly px-4">
        <h2 className="text-xl">Details</h2>
        <div className="flex w-full items-center justify-between">
          <p className="text-sm">Mute conversation</p>
          <div
            onClick={() => setIsMuteActive(!isMuteActive)}
            className={cn(
              "relative flex h-6 w-10 items-center rounded-xl transition-colors duration-200",
              isMuteActive ? "bg-gray-400" : "bg-lightBlue",
            )}
          >
            <div
              className={cn(
                "absolute left-0 h-6 w-6 cursor-pointer rounded-full border border-gray-400 bg-gray-200 transition-transform duration-200",
                isMuteActive ? "translate-x-0" : "translate-x-4",
              )}
            ></div>
          </div>
        </div>
        {/* {currentChatroom?.is_group && (
          <div className="my-2 flex w-full items-center justify-between pb-6">
            <p className="text-sm">Change group name</p>
            <Button size="sm" className="ml-2 text-sm">
              Change
            </Button>
          </div>
        )} */}
      </div>
      <div className="w-full border border-x-0 border-t-0 border-[#262626]"></div>
      <div className="flex h-full flex-col overflow-auto">
        <h4 className="p-6 font-semibold">Members</h4>
        {currentChatroom!.users
          .filter((x) => x.username !== userData!.username)
          .map((user) => (
            <Link key={user.user_id} to={`/${user.username}`}>
              <List image_url={[user.image_url]} title={user.username} />
            </Link>
          ))}
      </div>
      <ul className="border border-x-0 border-b-0 border-[#262626] px-6 py-1">
        {componentLists.map((list) => (
          <li
            key={list.id}
            onClick={list.fn}
            className="cursor-pointer py-4 text-lg text-red-500 transition-all duration-200 hover:text-red-400"
          >
            {list.list}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatDetails;
