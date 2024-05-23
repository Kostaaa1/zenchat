import Icon from "../../components/Icon";
import { useEffect, useMemo, useRef, useState } from "react";
import Button from "../../components/Button";
import { useLocation, useParams } from "react-router-dom";
import MessageInput from "./components/MessageInput";
import useChatStore from "../../utils/state/chatStore";
import Chat from "./components/Chat";
import UserChats from "./components/UserChats";
import { trpc } from "../../utils/trpcClient";
import useUser from "../../hooks/useUser";
import ChatHeader from "./components/ChatHeader";
import ChatDetails from "./components/ChatDetails";
import useModalStore from "../../utils/state/modalStore";
import { cn } from "../../utils/utils";
import useGeneralStore from "../../utils/state/generalStore";
import MainContainer from "../../components/MainContainer";

const Inbox = () => {
  const location = useLocation();
  const { userData } = useUser();
  const iconRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { chatRoomId } = useParams<{ chatRoomId: string }>();
  const currentChatroom = useChatStore((state) => state.currentChatroom);
  const showDetails = useChatStore((state) => state.showDetails);
  const isMobile = useGeneralStore((state) => state.isMobile);
  const { openModal } = useModalStore((state) => state.actions);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { setCurrentChatroomTitle, setCurrentChatroom, setShowDetails } =
    useChatStore((state) => state.actions);

  const scrollToStart = () => scrollRef.current?.scrollTo({ top: 0 });
  const { data } = trpc.chat.get.user_chatrooms.useQuery(userData!.id, {
    enabled: !!userData,
    refetchOnMount: "always",
  });

  const userChats = useMemo(() => {
    const filteredChats = data?.filter((x) =>
      x.users.some((y) => y.username === userData?.username && y.is_active),
    );
    return filteredChats;
  }, [data]);

  useEffect(() => {
    return () => {
      setShowDetails(false);
    };
  }, []);

  useEffect(() => {
    if (!userChats || userChats.length === 0 || !userData) return;
    const currentChat = userChats.find(
      (chat) => chat.chatroom_id === chatRoomId,
    );
    if (currentChat) {
      setCurrentChatroom({ ...currentChat, img_urls: [], new_message: "" });
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
    <MainContainer>
      <div
        ref={scrollRef}
        className={cn(
          "flex h-[100svh] w-full md:h-screen",
          isMobile ? "pb-16" : "pl-20",
        )}
      >
        {/* <UserChats userChats={userChats} isLoading={isLoading} /> */}
        {currentChatroom ? null : (
          <UserChats userChats={userChats} isLoading={isLoading} />
        )}
        {location.pathname !== "/inbox" && currentChatroom && chatRoomId && (
          <div className={"relative flex w-full flex-col justify-between"}>
            <ChatHeader />
            <Chat chatRoomId={chatRoomId} scrollRef={scrollRef} />
            <MessageInput scrollToStart={scrollToStart} iconRef={iconRef} />
          </div>
        )}
        {showDetails && currentChatroom && <ChatDetails />}
        {!isMobile &&
        location.pathname.includes("/inbox") &&
        !currentChatroom ? (
          <div className="flex w-full flex-col items-center justify-center text-center">
            <Icon
              name="MessageCircle"
              size="100px"
              className="cursor-default rounded-full border-2 border-white p-6"
            />
            <div className="flex h-14 flex-col items-center pt-4">
              <h3 className="text-xl">Your Messages</h3>
              <p className="py-3 pt-1 text-neutral-400">
                Send private photos and messages to a friend
              </p>
              <Button
                buttonColor="blue"
                onClick={() => openModal("newmessage")}
                className="text-sm"
              >
                Send message
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </MainContainer>
  );
};

export default Inbox;
