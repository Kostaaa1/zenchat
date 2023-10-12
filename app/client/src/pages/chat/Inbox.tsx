import Icon from "../main/components/Icon";
import { useEffect, useRef } from "react";
import Button from "../../components/Button";
import { useLocation, useParams } from "react-router-dom";
import useOutsideClick from "../../hooks/useOutsideClick";
import MessageInput from "./components/MessageInput";
import useChatStore from "../../utils/stores/chatStore";
import Chat from "./components/Chat";
import Avatar from "../../components/avatar/Avatar";
import useChatSocket from "../../hooks/useChatSocket";
import UserChats from "./components/UserChats";
import useChatCache from "../../hooks/useChatCache";
import { EmojiPickerContainer } from "./components/EmojiPicker";
import { trpc } from "../../utils/trpcClient";
const { VITE_SERVER_URL } = import.meta.env;
import io from "socket.io-client";
import useUser from "../../hooks/useUser";
import ErrorPage from "../ErrorPage";
import ChatHeader from "./components/ChatHeader";
const socket = io(VITE_SERVER_URL);

const Inbox = () => {
  const {
    handleSelectEmoji,
    setShowEmojiPicker,
    showEmojiPicker,
    currentChatroom,
    setCurrentChatroom,
  } = useChatStore();
  const location = useLocation();
  const { userId } = useUser();
  const emojiRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const params = useParams<{ chatRoomId: string }>();
  useOutsideClick([emojiRef, iconRef], "click", () =>
    setShowEmojiPicker(false),
  );

  const scrollToStart = () => {
    scrollRef.current?.scrollTo({ top: 0 });
  };

  const { data: userChats, isLoading: isUserChatsLoading } =
    trpc.chat.getCurrentChatRooms.useQuery(userId, {
      enabled: !!userId,
    });

  useEffect(() => {
    if (!userChats) return;

    const chatRoomData = userChats?.find(
      (chat) => chat.chatroom_id === params.chatRoomId,
    );
    if (chatRoomData) setCurrentChatroom(chatRoomData);
  }, [userChats, params.chatRoomId]);

  const { recieveNewSocketMessage } = useChatCache();
  useChatSocket({ socket, userId, recieveNewSocketMessage });

  return (
    <div className="ml-20 flex h-full max-h-screen w-full" ref={scrollRef}>
      <UserChats userChats={userChats} isLoading={isUserChatsLoading} />
      {location.pathname !== "/inbox" &&
      currentChatroom &&
      params.chatRoomId ? (
        <div className="w-full">
          <div className="relative flex h-full w-full flex-col justify-between pb-4">
            <ChatHeader />
            <Chat chatRoomId={params.chatRoomId} scrollRef={scrollRef} />
            <MessageInput scrollToStart={scrollToStart} iconRef={iconRef} />
          </div>
        </div>
      ) : null}
      {location.pathname === "/inbox" ? (
        <div className="flex w-full flex-col items-center justify-center ">
          <Icon
            name="MessageCircle"
            size="100px"
            className="rounded-full border-2 border-white p-6"
          />
          <div className="mt-4 flex h-14 flex-col items-center">
            <h3 className="text-xl">Your Messages</h3>
            <p className="py-3 pt-1 text-neutral-400">
              Send private photos and messages to a friend
            </p>
            <Button buttonColor="blue">Send message</Button>
          </div>
        </div>
      ) : null}
      <EmojiPickerContainer
        emojiRef={emojiRef}
        handleSelectEmoji={handleSelectEmoji}
        showEmojiPicker={showEmojiPicker}
      />
    </div>
  );
};

export default Inbox;
