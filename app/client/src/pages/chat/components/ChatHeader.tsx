import RenderAvatar from "../../../components/avatar/RenderAvatar";
import useChatStore from "../../../utils/stores/chatStore";
import Icon from "../../main/components/Icon";

const ChatHeader = () => {
  const { currentChatroom } = useChatStore();

  return (
    <div className="flex h-full max-h-[90px] items-center justify-between border-b border-[#262626] p-6">
      <div className="flex items-center">
        <RenderAvatar
          image_url_1={currentChatroom?.users[0].image_url as string}
          image_url_2={currentChatroom?.users[1].image_url as string}
        />
        <h1 className="ml-4 text-lg font-medium">
          {currentChatroom?.users[0].username}
        </h1>
      </div>
      <Icon name="Info" size="28px" />
    </div>
  );
};

export default ChatHeader;
