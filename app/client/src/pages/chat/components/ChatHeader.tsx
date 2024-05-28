import { Info } from "lucide-react";
import RenderAvatar from "../../../components/avatar/RenderAvatar";
import useChatStore from "../../../lib/stores/chatStore";
import useUser from "../../../hooks/useUser";
import { useNavigate } from "react-router-dom";
import useGeneralStore from "../../../lib/stores/generalStore";
import Icon from "../../../components/Icon";
import { cn } from "../../../utils/utils";

const ChatHeader = () => {
  const { activeChatroom, activeChatroomTitle, showDetails } = useChatStore(
    (state) => ({
      activeChatroom: state.activeChatroom,
      activeChatroomTitle: state.activeChatroomTitle,
      showDetails: state.showDetails,
    }),
  );
  const { setShowDetails, setActiveChatroom } = useChatStore(
    (state) => state.actions,
  );
  const { userData } = useUser();
  const navigate = useNavigate();
  const isMobile = useGeneralStore((state) => state.isMobile);

  const iconSize = showDetails ? 30 : 26;
  const fillColor = showDetails ? "white" : "";
  const color = showDetails ? "black" : "white";

  const handleIconClick = () => {
    setShowDetails(!showDetails);
  };

  const navigateToPrevious = () => {
    setActiveChatroom(null);
    navigate("/inbox");
  };

  const handleNavigate = () => {
    activeChatroom?.is_group
      ? setShowDetails(true)
      : navigate(
          `/${activeChatroom?.users.find(
            (x) => x.username !== userData?.username,
          )?.username}`,
        );
  };

  return (
    <div
      className={cn(
        "z-10 flex h-full max-h-[90px] cursor-pointer items-center justify-between border-b border-[#262626] bg-black",
        isMobile ? "h-[70px] p-2" : "h-full p-6",
      )}
    >
      {isMobile && <Icon name="ArrowLeft" onClick={navigateToPrevious} />}
      <div className="flex items-center space-x-3" onClick={handleNavigate}>
        {!isMobile && (
          <RenderAvatar
            avatarSize="md"
            image_urls={
              activeChatroom?.is_group
                ? {
                    image_url_1: activeChatroom.users[0]?.image_url,
                    image_url_2: activeChatroom.users[1]?.image_url,
                  }
                : {
                    image_url_1: activeChatroom?.users.find(
                      (x) => x.user_id !== userData!.id,
                    )?.image_url,
                  }
            }
          />
        )}
        <h1 className="text-lg font-semibold">{activeChatroomTitle}</h1>
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
