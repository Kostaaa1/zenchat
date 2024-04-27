import Icon from "../main/components/Icon";
import { useEffect, useMemo, useRef, useState } from "react";
import Button from "../../components/Button";
import { useLocation, useParams } from "react-router-dom";
import useOutsideClick from "../../hooks/useOutsideClick";
import MessageInput from "./components/MessageInput";
import useChatStore from "../../utils/stores/chatStore";
import Chat from "./components/Chat";
import UserChats from "./components/UserChats";
import { EmojiPickerContainer } from "./components/EmojiPicker";
import { trpc } from "../../utils/trpcClient";
import useUser from "../../hooks/useUser";
import ChatHeader from "./components/ChatHeader";
import ChatDetails from "./components/ChatDetails";
import useModalStore from "../../utils/stores/modalStore";
import { TChatroom } from "../../../../server/src/types/types";

const Inbox = () => {
  const location = useLocation();
  const { chat } = trpc.useUtils();
  const { userData } = useUser();
  const emojiRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { chatRoomId } = useParams<{ chatRoomId: string }>();
  const currentChatroom = useChatStore((state) => state.currentChatroom);
  const showDetails = useChatStore((state) => state.showDetails);
  const showEmojiPicker = useChatStore((state) => state.showEmojiPicker);
  const { setIsNewMessageModalModalOpen } = useModalStore(
    (state) => state.actions,
  );
  const {
    setShowEmojiPicker,
    setCurrentChatroomTitle,
    setCurrentChatroom,
    setShowDetails,
  } = useChatStore((state) => state.actions);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    return () => {
      setShowDetails(false);
    };
  }, []);

  useOutsideClick([emojiRef, iconRef], "click", () =>
    setShowEmojiPicker(false),
  );

  const scrollToStart = () => {
    scrollRef.current?.scrollTo({ top: 0 });
  };

  const { data } = trpc.chat.get.user_chatrooms.useQuery(userData!.id, {
    enabled: !!userData,
    // refetchOnMount: "always",
  });

  const userChats = useMemo(() => {
    const filteredChats = data?.filter((x) =>
      x.users.some((y) => y.username === userData?.username && y.is_active),
    );
    return filteredChats;
  }, [data, userData]);

  useEffect(() => {
    if (!userChats || userChats.length === 0 || !userData) return;
    const currentChat = userChats?.find(
      (chat) => chat.chatroom_id === chatRoomId,
    );
    if (currentChat) {
      setCurrentChatroom(currentChat);
      setCurrentChatroomTitle(
        currentChat.users
          .filter((chat) => chat.username !== userData.username)
          .map((chat) => chat.username)
          .join(", "),
      );
    }
    setIsLoading(false);
  }, [userChats, chatRoomId, userData]);

  return (
    <div className="flex h-full max-h-screen w-full pl-20" ref={scrollRef}>
      <UserChats userChats={userChats} isLoading={isLoading} />
      {location.pathname !== "/inbox" && currentChatroom && chatRoomId && (
        <div className="w-full">
          <div className="relative flex h-full w-full flex-col justify-between pb-4">
            <ChatHeader />
            <Chat chatRoomId={chatRoomId} scrollRef={scrollRef} />
            <MessageInput scrollToStart={scrollToStart} iconRef={iconRef} />
          </div>
        </div>
      )}
      {showDetails && currentChatroom && <ChatDetails />}
      {location.pathname === "/inbox" ? (
        <div className="flex w-full flex-col items-center justify-center text-center ">
          <Icon
            name="MessageCircle"
            size="100px"
            className="rounded-full border-2 border-white p-6"
          />
          <div className="flex h-14 flex-col items-center pt-4">
            <h3 className="text-xl">Your Messages</h3>
            <p className="py-3 pt-1 text-neutral-400">
              Send private photos and messages to a friend
            </p>
            <Button
              buttonColor="blue"
              onClick={() => setIsNewMessageModalModalOpen(true)}
              className="text-sm"
            >
              Send message
            </Button>
          </div>
        </div>
      ) : null}
      <EmojiPickerContainer
        emojiRef={emojiRef}
        showEmojiPicker={showEmojiPicker}
      />
    </div>
  );
};

export default Inbox;
