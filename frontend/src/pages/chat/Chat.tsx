import { FC } from "react";
import SideChat from "../chat/SideChat";

interface ChatProps {}

const Chat: FC<ChatProps> = () => {
  return (
    <div className="flex h-full w-full bg-emerald-500">
      <SideChat />
    </div>
  );
};

export default Chat;
