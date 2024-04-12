import { Info } from "lucide-react";
import RenderAvatar from "../../../components/avatar/RenderAvatar";
import useChatStore from "../../../utils/stores/chatStore";

const InfoIcon = () => {
  const { setShowDetails, showDetails } = useChatStore();

  const handleIconClick = () => {
    setShowDetails(!showDetails);
  };

  const iconSize = showDetails ? 34 : 30;
  const fillColor = showDetails ? "white" : "";
  const color = showDetails ? "black" : "white";

  return (
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
  );
};

const ChatHeader = () => {
  const { currentChatroom } = useChatStore();

  return (
    <div className="flex h-full max-h-[90px] items-center justify-between border-b border-[#262626] p-6 px-4">
      <div className="flex items-center">
        <RenderAvatar
          image_urls={{
            image_url_1: currentChatroom?.users[0].image_url as string,
            image_url_2: currentChatroom?.is_group
              ? currentChatroom?.users[1].image_url
              : undefined,
          }}
          avatarSize="md"
        />
        <h1 className="ml-2 text-lg font-medium">
          {currentChatroom?.users.map((x) => x.username).join(", ")}
        </h1>
      </div>
      <InfoIcon />
    </div>
  );
};

export default ChatHeader;
