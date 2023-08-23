import { useQuery } from "@tanstack/react-query";
import supabase from "../../lib/supabaseClient";
import useCachedUser from "./useCachedUser";

export interface TChatRoomData {
  id: string;
  chatroom_id: string;
  created_at: string;
  user_id: string;
  last_message: string;
  image_url: string;
  username: string;
}

const useUserChats = () => {
  const { userData } = useCachedUser();

  const fetchChatData = async (chatroom_id: string, user_id: string) => {
    const { data, error } = await supabase
      .from("chatroom_users")
      .select("*, users(username, image_url), chatrooms(last_message)")
      .neq("user_id", user_id)
      .eq("chatroom_id", chatroom_id);

    if (!data || error) {
      throw new Error(
        `Error fetching chat data for chatroom ${chatroom_id}: ${
          error?.message || "No data"
        }`,
      );
    }

    return data[0];
  };

  const getUserChatRooms = async (): Promise<TChatRoomData[]> => {
    try {
      if (!userData) {
        throw new Error("No user data, in getUserChatRooms");
      }

      const { data: chatrooms, error } = await supabase
        .from("chatroom_users")
        .select("chatroom_id")
        .eq("user_id", userData.id);

      if (!chatrooms || error) {
        throw new Error(error.message);
      }

      const conversations = await Promise.all(
        chatrooms.map(async (chatroom) => {
          const chatData = await fetchChatData(
            chatroom.chatroom_id,
            userData.id,
          );

          const {
            users,
            chatrooms: chatroomData,
            id,
            user_id,
            created_at,
            chatroom_id,
          } = chatData;

          return {
            id,
            user_id,
            created_at,
            chatroom_id,
            last_message: chatroomData.last_message,
            image_url: users.image_url,
            username: users.username,
          };
        }),
      );

      return conversations as TChatRoomData[];
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const chats = useQuery(["user-chats"], getUserChatRooms, {
    enabled: !!userData,
  });

  return {
    userChats: chats.data,
    ...chats,
  };
};

export default useUserChats;
