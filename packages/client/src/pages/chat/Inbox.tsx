import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import useChatStore from "../../lib/stores/chatStore";
import UserChats from "./components/UserChats";
import { trpc } from "../../lib/trpcClient";
import useUser from "../../hooks/useUser";
import Chat from "./components/Chat";
import ChatDetails from "./components/ChatDetails";
import { cn } from "../../utils/utils";
import { loadImage } from "../../utils/image";
import useGeneralStore from "../../lib/stores/generalStore";
import MainContainer from "../../components/MainContainer";
import useChatMapStore from "../../lib/stores/chatMapStore";
import Icon from "../../components/Icon";
import Button from "../../components/Button";
import useModalStore from "../../lib/stores/modalStore";
import { TChatroom, TUserData } from "../../../../server/src/types/types";

const Inbox = () => {
  const location = useLocation();
  const { userData } = useUser();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { chatRoomId } = useParams<{ chatRoomId: string }>();
  const isMobile = useGeneralStore((state) => state.isMobile);
  const { openModal } = useModalStore((state) => state.actions);
  const utils = trpc.useUtils();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  ///////////// Returnuj is useChat valjdd??
  const { inputImages, inputMessages } = useChatMapStore((state) => ({
    inputMessages: state.inputMessages,
    inputImages: state.inputImages,
  }));
  const { activeChatroom, isChatLoading, messages, showDetails } = useChatStore(
    (state) => ({
      activeChatroom: state.activeChatroom,
      activeChatroomTitle: state.activeChatroomTitle,
      showDetails: state.showDetails,
      messages: state.messages,
      isChatLoading: state.isChatLoading,
    }),
  );
  const {
    setActiveChatroom,
    setMessages,
    setIsChatLoading,
    setActiveChatroomTitle,
  } = useChatStore((state) => state.actions);
  /////////////

  const { data, isFetched } = trpc.chat.get.user_chatrooms.useQuery(
    userData!.id,
    {
      enabled: !!userData,
      refetchOnReconnect: "always",
      refetchOnMount: "always",
    },
  );

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
    if (activeChat) prepareChat(activeChat, userData);
    setIsLoading(false);
  }, [userChats, chatRoomId, userData]);

  const prepareChat = async (activeChat: TChatroom, userData: TUserData) => {
    setActiveChatroom(activeChat);
    setActiveChatroomTitle(
      activeChat.users
        .filter((chat) => chat.username !== userData.username)
        .map((chat) => chat.username)
        .join(", "),
    );
    const msgs = await utils.chat.messages.get.fetch({
      chatroom_id: activeChat.chatroom_id,
    });

    if (msgs) {
      await Promise.all(
        msgs
          .filter((x) => x.is_image)
          .map(async (msg) => await loadImage(msg.content)),
      );
      setMessages(msgs);
      setIsChatLoading(false);
    }
  };

  return (
    <MainContainer>
      <div
        ref={scrollRef}
        className={cn(
          "flex h-[100svh] w-full items-center",
          isMobile ? "pb-16" : "pl-20",
        )}
      >
        {(!chatRoomId || (chatRoomId && !isMobile)) && (
          <UserChats
            userChats={userChats}
            isLoading={!isFetched && isLoading}
          />
        )}
        {location.pathname !== "/inbox" && activeChatroom && messages && (
          <Chat
            activeChatroom={activeChatroom}
            messages={messages}
            scrollRef={scrollRef}
            isLoading={isChatLoading}
          />
        )}
        {showDetails && activeChatroom && <ChatDetails />}
        {!isMobile && !activeChatroom && (
          <div className="flex h-full w-full flex-col items-center justify-center text-center">
            {isLoading ? (
              <>
                <div className="h-[100px] w-[100px] animate-pulse rounded-full bg-neutral-800 pb-6"></div>
                <div className="flex h-max flex-col items-center space-y-3 pt-4">
                  <div className="h-4 w-40 animate-pulse rounded-xl bg-neutral-800"></div>
                  <div className="h-4 w-60 animate-pulse rounded-xl bg-neutral-800 pt-1"></div>
                  <div className="h-8 w-28 animate-pulse rounded-xl bg-neutral-800"></div>
                </div>
              </>
            ) : (
              <>
                <Icon
                  name="MessageCircle"
                  size="100px"
                  className="cursor-default rounded-full border-2 border-white p-6"
                />
                <div className="flex h-max flex-col items-center pt-4">
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
              </>
            )}
          </div>
        )}
      </div>
    </MainContainer>
  );
};

export default Inbox;
