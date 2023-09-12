import supabase from "../../db/supabase";
import { TChatRoomData, TChatHistory, TMessage } from "../../types/types";
// import {} from "../../types/types";

export const getUserIdFromChatroom = async (
  chatroom_id: string
): Promise<{ user_id: string }[]> => {
  const { data: chatroomData, error } = await supabase
    .from("chatroom_users")
    .select("user_id")
    .eq("chatroom_id", chatroom_id);

  if (!chatroomData || error) {
    console.log("Error: ", error);
    throw new Error(error.message);
  }

  console.log("CHATROOM DATA CHECKING TYPE", chatroomData);
  return chatroomData;
};

export const getChatroomId = async (
  userId: string,
  inspectedUserId: string
): Promise<string | undefined> => {
  try {
    const userIds: string[] = [userId, inspectedUserId];

    const { data, error } = await supabase.rpc("get_chatroom_id", {
      user_id_1: userIds[0],
      user_id_2: userIds[1],
    });

    if (error) {
      throw new Error(`Error executing SQL Procedure: ${error}`);
    }

    if (data.length === 0) {
      const chatroomId = await createChatRoom();
      if (chatroomId) {
        await insertChatroomUser(chatroomId, userIds[0]);
        await insertChatroomUser(chatroomId, userIds[1]);

        return chatroomId;
      }
    } else {
      return data[0].chatroom_id;
    }
  } catch (error) {
    console.error(error);
  }
};

// for updating the cache
export const fetchAllMessages = async (
  chatroom_id: string
): Promise<TMessage[]> => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chatroom_id", chatroom_id)
    .order("created_at", { ascending: false });

  if (!data) {
    throw new Error(`Error when fetching all messages: ${error.message}`);
  }

  console.log(data);
  return data;
};

export const fetchSpecifiedChatData = async (
  chatroom_id: string,
  currentUser_id: string
) => {
  const { data, error } = await supabase
    .from("chatroom_users")
    .select("*, users(username, image_url), chatrooms(last_message)")
    .neq("user_id", currentUser_id)
    .eq("chatroom_id", chatroom_id);

  if (!data) {
    throw new Error(
      `Error fetching chat data for chatroom ${chatroom_id}: ${
        error?.message || "No data"
      }`
    );
  }

  return data[0];
};

export const getCurrentChatRooms = async (
  userId: string
): Promise<TChatRoomData[]> => {
  try {
    const { data: chatrooms, error } = await supabase
      .from("chatroom_users")
      .select("chatroom_id")
      .eq("user_id", userId);

    if (!chatrooms || error) {
      throw new Error(error.message);
    }

    const conversations = await Promise.all(
      chatrooms.map(async (chatroom) => {
        const chatData = await fetchSpecifiedChatData(
          chatroom.chatroom_id,
          userId
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
          messages: [],
        };
      })
    );

    console.log("REturn from getCurrentChatRooms", conversations);
    return conversations;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getSearchedHistory = async (
  id: string
): Promise<TChatHistory[]> => {
  try {
    const { data, error } = await supabase
      .from("searched_users")
      .select("*, users(username, image_url, first_name, last_name)")
      .eq("main_user_id", id);

    if (!data) {
      console.log(error);
    }

    return data || [];
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const deleteChat = async (id: string) => {
  const { error } = await supabase
    .from("searched_users")
    .delete()
    .eq("user_id", id);

  if (error) {
    throw new Error(error?.message);
  }
};

export const deleteAllChats = async (id: string) => {
  const { error } = await supabase
    .from("searched_users")
    .delete()
    .eq("main_user_id", id);

  if (error) {
    console.log(error);
  }
};

export const addUserToChatHistory = async ({
  main_user_id,
  user_id,
}: {
  main_user_id: string;
  user_id: string;
}) => {
  const { data: existingData, error: existingError } = await supabase
    .from("searched_users")
    .select("main_user_id")
    .eq("user_id", user_id);

  if (existingError) {
    console.log(existingError);
    return;
  }

  if (existingData.length === 0) {
    const { error } = await supabase
      .from("searched_users")
      .insert({ main_user_id, user_id });

    if (error) {
      console.log(error);
    }
  }
};

export const insertChatroomUser = async (
  chatroomId: string,
  userId: string
): Promise<void> => {
  await supabase
    .from("chatroom_users")
    .insert({ chatroom_id: chatroomId, user_id: userId });
};

export const createChatRoom = async () => {
  try {
    const { data, error } = await supabase
      .from("chatrooms")
      .insert({ last_message: "" })
      .select("id");

    if (!data) {
      console.log(error.message);
    }

    return data?.[0].id;
  } catch (error) {
    console.log(error);
  }
};
