import { Info } from "lucide-react";
import RenderAvatar from "../../../components/avatar/RenderAvatar";
import useChatStore from "../../../utils/state/chatStore";
import useUser from "../../../hooks/useUser";
import { useNavigate } from "react-router-dom";

const ChatHeader = () => {
  const currentChatroom = useChatStore((state) => state.currentChatroom);
  const currentChatroomTitle = useChatStore(
    (state) => state.currentChatroomTitle,
  );
  const { setShowDetails } = useChatStore((state) => state.actions);
  const showDetails = useChatStore((state) => state.showDetails);
  const { userData } = useUser();
  const navigate = useNavigate();
  const iconSize = showDetails ? 30 : 26;
  const fillColor = showDetails ? "white" : "";
  const color = showDetails ? "black" : "white";

  const handleIconClick = () => {
    setShowDetails(!showDetails);
  };

  const handleNavigate = () => {
    currentChatroom?.is_group
      ? setShowDetails(true)
      : navigate(`/${currentChatroom?.users[0].username}`);
  };

  return (
    <div className="z-10 flex h-full max-h-[90px] cursor-pointer items-center justify-between border-b border-[#262626] bg-black p-6 px-4">
      <div className="flex items-center space-x-4" onClick={handleNavigate}>
        <RenderAvatar
          avatarSize="md"
          image_urls={
            currentChatroom?.is_group
              ? {
                  image_url_1: currentChatroom.users[0]?.image_url,
                  image_url_2: currentChatroom.users[1]?.image_url,
                }
              : {
                  image_url_1: currentChatroom?.users.find(
                    (x) => x.user_id !== userData!.id,
                  )?.image_url,
                }
          }
        />
        <h1 className="text-lg">{currentChatroomTitle}</h1>
      </div>
      <Info
        onClick={handleIconClick}
        width={iconSize}
        height={iconSize}
        fill={fillColor}
        color={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        className="cursor-pointer"
      />
    </div>
  );
};

export default ChatHeader;
