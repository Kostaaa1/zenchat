import { useUser, UserButton } from "@clerk/clerk-react";
import { FC, useEffect } from "react";
import Icon from "../main/components/Icon";
import { cn } from "../../utils/utils";

export const ChatList = ({
  imageUrl,
  userName,
  lastMessage,
}: {
  imageUrl: string | undefined;
  userName: string | null | undefined;
  lastMessage: string | undefined;
}) => {
  return (
    <li className="flex items-center p-2 px-4 bg-[#000000] hover:bg-white hover:bg-opacity-10 cursor-pointer">
      <img src={imageUrl} alt="user-img" className="w-16 h-16 rounded-full" />
      <div className="text-lg font-medium ml-4">
        {userName}
        <p className="mt-1 text-sm text-neutral-400">{lastMessage}</p>
      </div>
    </li>
  );
};

const SideChat = () => {
  const { user } = useUser();

  return (
    <div className="flex flex-col w-[420px] bg-[#000000] border-r border-[#262626] h-full">
      <div className="h-[100px] border-b border-[#262626] flex justify-between items-center p-4">
        <div className="flex items-center cursor-pointer active:text-zinc-500">
          <h1 className="text-2xl font-bold mr-1"> {user?.username} </h1>
          <Icon name="ChevronDown" size="20px" />
        </div>
        <Icon name="PenSquare" size="28px" className="active:text-zinc-500" />
      </div>
      <ul className="overflow-y-scroll h-full scrollbar-colored">
        <ChatList
          imageUrl={user?.imageUrl}
          userName={user?.username}
          lastMessage="Caoo sta ima!"
        />
        <ChatList
          imageUrl={user?.imageUrl}
          userName={"Dragan"}
          lastMessage="Caoo sta ima!"
        />
      </ul>
    </div>
  );
};

export default SideChat;
