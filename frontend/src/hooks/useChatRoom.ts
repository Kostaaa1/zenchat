import { useQuery } from "@tanstack/react-query";
import supabase from "../../lib/supabaseClient";
import useUserChats, { TMessage } from "./useUserChats";

type TUseChatRoomProps = {
  chatRoomId: string | undefined;
};

const useChatRoom = ({ chatRoomId }: TUseChatRoomProps) => {
  const { userChats } = useUserChats();

  const fetchAllMessages = async () => {
    const currentChatData = userChats?.find(
      (chat) => chat.chatroom_id === chatRoomId,
    );
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("chatroom_id", chatRoomId);

    if (currentChatData) {
      currentChatData.messages = data as TMessage[];
    }

    return currentChatData;
  };

  return useQuery(["chatroom-data"], fetchAllMessages, {
    enabled: !!userChats && !!chatRoomId,
  });
};

export default useChatRoom;
