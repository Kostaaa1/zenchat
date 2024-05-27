import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import useChatStore from "../../utils/state/chatStore";
import UserChats from "./components/UserChats";
import { trpc } from "../../utils/trpcClient";
import useUser from "../../hooks/useUser";
import Chat from "./components/Chat";
import ChatDetails from "./components/ChatDetails";
import { cn, loadImage } from "../../utils/utils";
import useGeneralStore from "../../utils/state/generalStore";
import MainContainer from "../../components/MainContainer";
import useChatMapStore from "../../utils/state/chatMapStore";

const Inbox = () => {
  const location = useLocation();
  const { userData } = useUser();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { chatRoomId } = useParams<{ chatRoomId: string }>();
  const isMobile = useGeneralStore((state) => state.isMobile);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  ///////////// Returnuj is useChat valjdd??
  const { inputImages, inputMessages } = useChatMapStore((state) => ({
    inputMessages: state.inputMessages,
    inputImages: state.inputImages,
  }));
  const { activeChatroom, showDetails } = useChatStore((state) => ({
    activeChatroom: state.activeChatroom,
    activeChatroomTitle: state.activeChatroomTitle,
    showDetails: state.showDetails,
  }));
  const { setActiveChatroom, setActiveChatroomTitle } = useChatStore(
    (state) => state.actions,
  );
  /////////////
  const { data } = trpc.chat.get.user_chatrooms.useQuery(userData!.id, {
    enabled: !!userData,
    refetchOnReconnect: true,
  });

  const userChats = useMemo(() => {
    const filteredChats = data?.filter((x) =>
      x.users.some((y) => y.username === userData?.username && y.is_active),
    );

    if (filteredChats) {
      filteredChats.forEach(async (chat) => {
        await Promise.all(
          chat.users.map(
            async (user) => user.image_url && (await loadImage(user.image_url)),
          ),
        );
        inputMessages.set(chat.chatroom_id, "");
        inputImages.set(chat.chatroom_id, []);
      });
    }
    return filteredChats;
  }, [data]);

  useEffect(() => {
    if (!userChats || userChats.length === 0 || !userData) return;
    const activeChat = userChats.find(
      (chat) => chat.chatroom_id === chatRoomId,
    );
    if (activeChat) {
      setActiveChatroom(activeChat);
      setActiveChatroomTitle(
        activeChat.users
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
        {isMobile && activeChatroom ? null : (
          <UserChats userChats={userChats} isLoading={isLoading} />
        )}
        {location.pathname !== "/inbox" && activeChatroom && (
          <Chat activeChatroom={activeChatroom} scrollRef={scrollRef} />
        )}
        {showDetails && activeChatroom && <ChatDetails />}
        {/* {!isMobile &&
        location.pathname.includes("/inbox") &&
        !activeChatroom ? (
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
        ) : null} */}
      </div>
    </MainContainer>
  );
};

export default Inbox;
