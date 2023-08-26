import Icon from "../main/components/Icon";
import { FormEvent, useCallback, useEffect, useRef } from "react";
import Button from "../../components/Button";
import { useLocation, useParams } from "react-router-dom";
import UserChats from "./UserChats";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useUserChats, {
  TChatRoomData,
  TMessage,
} from "../../hooks/useUserChats";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { AnimatePresence, motion } from "framer-motion";
import useOutsideClick from "../../hooks/useOutsideClick";
import supabase from "../../../lib/supabaseClient";
import MessageInput from "./MessageInput";
import useMessageStore from "../../utils/stores/messageStore";
import Chat from "./Chat";
import io from "socket.io-client";
const socket = io("http://localhost:3000");

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
  useOutsideClick([emojiRef, iconRef], () => setShowEmojiPicker(false));
  const queryClient = useQueryClient();
  const { userChats } = useUserChats();

  const { data: activeChatroomData } = useQuery(
    ["chatroom-data", params.chatRoomId],
    async () => {
      console.log("ran query function", params.chatRoomId);
      const currentChatData = userChats?.find(
        (chat) => chat.chatroom_id === params.chatRoomId,
      );

      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("chatroom_id", params.chatRoomId)
        .order("created_at", { ascending: false });
      if (currentChatData) {
        currentChatData.messages = data as TMessage[];
      }

      return currentChatData;
    },
    {
      enabled: !!userChats && !!params.chatRoomId,
    },
  );

  const handleSendMessage = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      if (message.length === 0) {
        return;
      }
      const messageData = {
        content: message,
        sender_id: activeChatroomData?.user_id,
        chatroom_id: activeChatroomData?.chatroom_id,
      };

      socket.emit("new-message", messageData);
      setMessage("");
    } catch (error) {
      console.log(error);
    }
  };

  const handleReceiveMessage = useCallback((message: TMessage[]) => {
    // queryClient.invalidateQueries(["user-chats"]);
    const { chatRoomId } = params;

    const cachedChatroomData = queryClient.getQueryData<TChatRoomData>([
      "chatroom-data",
      chatRoomId,
    ]);

    if (cachedChatroomData) {
      queryClient.setQueryData(["chatroom-data", chatRoomId], {
        ...cachedChatroomData,
        messages: [message, ...cachedChatroomData.messages],
      });
    }
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to Socket");
    });
    socket.on("new-message", handleReceiveMessage);

    return () => {
      socket.off("connect", () => {
        console.log("Disconnected From Socket");
      });
      socket.off("new-message", handleReceiveMessage);
    };
  }, [handleReceiveMessage]);

  useEffect(() => {
    console.log(activeChatroomData);
  }, [activeChatroomData]);

  return (
    <div className="ml-20 flex h-full w-full">
      <UserChats />
      {location.pathname === "/inbox" && (
        <div className="flex w-full flex-col items-center justify-center">
          <Icon
            name="MessageCircle"
            size="122px"
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
      {activeChatroomData && params.chatRoomId && (
        <div className="relative flex w-full flex-col justify-between pb-4">
          <Chat
            activeChatroomData={activeChatroomData}
            chatRoomId={params.chatRoomid}
          />
          <MessageInput
            iconRef={iconRef}
            handleSendMessage={handleSendMessage}
          />
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
