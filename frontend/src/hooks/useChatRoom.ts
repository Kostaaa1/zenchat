import { useQuery, useQueryClient } from "@tanstack/react-query";
import supabase from "../../lib/supabaseClient";
import useUserChats, { TChatRoomData, TMessage } from "./useUserChats";
import { useParams } from "react-router-dom";

const useChatRoom = () => {
  const { userChats } = useUserChats();
  const queryClient = useQueryClient();
  const params = useParams();
  const { chatRoomId } = params;
  const queryKey = ["chatroom-data", chatRoomId];

  const fetchAllMessages = async () => {
    const currentChatData = userChats?.find(
      (chat) => chat.chatroom_id === chatRoomId,
    );
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("chatroom_id", chatRoomId)
      .order("created_at", { ascending: false });

    if (currentChatData) {
      currentChatData.messages = data as TMessage[];
    }

    return currentChatData;
  };

  const data = useQuery(queryKey, fetchAllMessages, {
    enabled: !!userChats && !!chatRoomId,
  });

  const addNewMessageQuery = (message: TMessage) => {
    queryClient.setQueryData<TChatRoomData>(queryKey, (oldData) => {
      if (oldData) {
        return {
          ...oldData,
          messages: [message, ...oldData.messages],
        };
      }
      return oldData;
    });
  };

  return {
    ...data,
    addNewMessageQuery,
  };
};

export default useChatRoom;
