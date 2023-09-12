import Icon from "../main/components/Icon";
import { FormEvent, useCallback, useEffect, useRef } from "react";
import Button from "../../components/Button";
import { useLocation, useParams } from "react-router-dom";
import UserChats from "./UserChats";
import Picker from "@emoji-mart/react";
import { AnimatePresence, motion } from "framer-motion";
import useOutsideClick from "../../hooks/useOutsideClick";
import MessageInput from "./MessageInput";
import useMessageStore from "../../utils/stores/messageStore";
import Chat from "./Chat";
import getCurrentDate from "../../utils/getCurrentDate";
import io from "socket.io-client";
import { Loader2 } from "lucide-react";
import { TMessage } from "../../../../server/src/types/types";
import { trpc } from "../../utils/trpcClient";
import useStore from "../../utils/stores/store";
const { VITE_SERVER_URL } = import.meta.env;
const socket = io(VITE_SERVER_URL);
import data from "@emoji-mart/data";
import Avatar from "../../components/Avatar";

const Inbox = () => {
  const {
    message,
    setMessage,
    handleSelectEmoji,
    setShowEmojiPicker,
    showEmojiPicker,
  } = useMessageStore();
  const location = useLocation();
  const params = useParams();
  const emojiRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  useOutsideClick([emojiRef, iconRef], () => setShowEmojiPicker(false));
  const { userId } = useStore();
  const ctx = trpc.useContext();

  const { data: userChats, isLoading: isUserChatsLoading } =
    trpc.chat.getCurrentChatRooms.useQuery(userId, { enabled: !!userId });

  const currentChatData = userChats?.find(
    (chat) => chat.chatroom_id === params.chatRoomId,
  );

  const { data: messages, isLoading } = trpc.chat.fetchAllMessages.useQuery(
    {
      activeChat: currentChatData,
      chatroom_id: params.chatRoomId as string,
    },
    {
      enabled: !!params.chatRoomId && !!userChats,
      keepPreviousData: true,
    },
  );

  useEffect(() => {
    if (messages) {
      ctx.chat.getCurrentChatRooms.setData(userId, (oldData) => {
        if (oldData) {
          return oldData.map((chat) =>
            chat.chatroom_id === params.chatRoomId
              ? { ...chat, messages }
              : chat,
          );
        }
        return oldData;
      });
    }
  }, [messages]);

  useEffect(() => {
    console.log(userChats);
  }, [userChats]);

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSendMessage = async (e: FormEvent): Promise<void> => {
    try {
      e.preventDefault();
      scrollToTop();

      if (!currentChatData || message.trim() === "") {
        return;
      }

      const { user_id, chatroom_id } = currentChatData;

      const messageData = {
        content: message,
        sender_id: user_id,
        chatroom_id,
        created_at: getCurrentDate(),
      };

      const { chatRoomId } = params;
      const { content, created_at } = messageData;

      if (chatRoomId) {
        updateMessagesCache(chatRoomId, messageData);
        updateCurrenChatRoomCache(content, created_at);
      }

      socket.emit("new-message", messageData);
      setMessage("");
    } catch (error) {
      console.log(error);
    }
  };

  const updateMessagesCache = (chatRoomId: string, messageData: TMessage) => {
    ctx.chat.fetchAllMessages.setData(
      {
        chatroom_id: chatRoomId,
      },
      (staleChats) => {
        if (staleChats) {
          return [messageData, ...staleChats];
        }
        return staleChats;
      },
    );
  };

  const updateCurrenChatRoomCache = (content: string, created_at: string) => {
    ctx.chat.getCurrentChatRooms.setData(userId, (oldData) => {
      return oldData?.map((chat) =>
        chat.chatroom_id === params.chatRoomId
          ? {
              ...chat,
              last_message: content,
              created_at: created_at,
            }
          : chat,
      );
    });
  };

  const handleReceiveMessage = useCallback(
    (messageData: TMessage) => {
      console.log("Message sent", messageData);
    },
    [params.chatRoomId, userId, ctx.chat.getCurrentChatRooms],
  );

  useEffect(() => {
    socket.emit("join-room", params.chatRoomId);
    socket.on("new-message", handleReceiveMessage);

    return () => {
      socket.off("disconnect", () => {
        console.log("Disconnected fron new-message socket");
      });
      socket.off("join-room", handleReceiveMessage);
      socket.off("new-message", handleReceiveMessage);
    };
  }, [params]);

  return (
    <div className="ml-20 flex h-full w-full">
      <UserChats userChats={userChats} isLoading={isUserChatsLoading} />
      {location.pathname !== "/inbox" ? (
        <div className="w-full">
          <div className="relative flex h-full w-full flex-col justify-between pb-4">
            <div className="flex h-full max-h-[90px] items-center justify-between border-b border-[#262626] p-6">
              <div className="flex items-center">
                <Avatar image_url={currentChatData?.image_url} />
                <h1 className="ml-4 text-xl font-semibold">
                  {currentChatData?.username}
                </h1>
              </div>
              <Icon name="Info" size="28px" />
            </div>
            <Chat
              image_url={currentChatData?.image_url}
              username={currentChatData?.username}
              messages={messages}
              user_id={currentChatData?.user_id}
              chatRoomId={params.chatRoomid}
              scrollRef={scrollRef}
              isLoading={isLoading}
              // isRefetching={isRefetching}
            />
            <MessageInput
              iconRef={iconRef}
              handleSendMessage={handleSendMessage}
            />
          </div>
        </div>
      ) : null}
      {location.pathname === "/inbox" && (
        <div className="flex w-full flex-col items-center justify-center ">
          <Icon
            name="MessageCircle"
            size="100px"
            className="rounded-full border-2 border-white p-6"
          />
          <div className="mt-4 flex h-14 flex-col items-center">
            <h3 className="text-2xl">Your Messages</h3>
            <p className="py-3 pt-1 text-neutral-400">
              Send private photos and messages to a friend
            </p>
            <Button buttonColor="blue">Send message</Button>
          </div>
        </div>
      )}
      <AnimatePresence>
        {showEmojiPicker ? (
          <motion.div
            ref={emojiRef}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute bottom-24 left-[540px]"
          >
            <Picker
              theme="dark"
              data={data}
              onEmojiSelect={handleSelectEmoji}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default Inbox;
