import { TRPCError } from "@trpc/server";
import { purgeImageCache } from "../../config/imagekit";
import supabase from "../../config/supabase";
import { deleteImageFromS3 } from "../../middleware/multer";
import {
  TChatRoomData,
  TChatHistory,
  TMessage,
  TPopulateColumnsResponse,
} from "../../types/types";
import "dotenv/config";

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

  return chatroomData;
};

export const getMessages = async (chatroom_id: string): Promise<TMessage[]> => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chatroom_id", chatroom_id)
    .order("created_at", {
      ascending: false,
    })
    .limit(22);

  if (!data) {
    throw new Error(`Error when fetching all messages: ${error.message}`);
  }

  return data;
};

export const unsendMessage = async ({
  id,
  imageUrl,
}: {
  id: string;
  imageUrl: string | null;
}) => {
  try {
    const { data, error } = await supabase
      .from("messages")
      .delete()
      .eq("id", id);

    if (!data) {
      console.log(error);
    }

    if (imageUrl) {
      console.log(
        "This si iamgekit link for purifying: ",
        process.env.IMAGEKIT_URL_ENDPOINT + imageUrl
      );

      await purgeImageCache(process.env.IMAGEKIT_URL_ENDPOINT + imageUrl);
      await deleteImageFromS3(imageUrl);
    }
  } catch (error) {
    console.log(error);
  }
};

export const getMoreMessages = async (
  chatroom_id: string,
  lastMessageDate: string
): Promise<TMessage[]> => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chatroom_id", chatroom_id)
    .lt("created_at", lastMessageDate)
    .order("created_at", { ascending: false })
    .limit(15);

  if (!data) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Error when fetching all messages: ${error.message}`,
    });
  }

  return data;
};

// Create new message:
export const sendMessage = async (messageData: TMessage) => {
  const { chatroom_id, content, created_at } = messageData;
  const { error: newMessageError } = await supabase
    .from("messages")
    .insert(messageData);

  if (messageData.isImage) return;
  const { error: lastMessageUpdateError } = await supabase
    .from("chatrooms")
    .update({
      last_message: content,
      created_at,
    })
    .eq("id", chatroom_id);

  if (lastMessageUpdateError) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Error when updating chatroom last message: ${lastMessageUpdateError}`,
    });
  }

  if (newMessageError) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Error when inserting new message: ${newMessageError}`,
    });
  }
};

export const populateForeignColumns = async (
  chatroom_id: string,
  currentUser_id: string
): Promise<TPopulateColumnsResponse> => {
  const { data, error } = await supabase
    .from("chatroom_users")
    .select(
      "*, users(username, image_url), chatrooms(last_message, created_at)"
    )
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

export const getUserChatRooms = async (
  userId: string
): Promise<{ chatroom_id: string }[]> => {
  const { data, error } = await supabase
    .from("chatroom_users")
    .select("chatroom_id")
    .eq("user_id", userId);

  if (!data || error) {
    throw new Error(error.message);
  }

  return data;
};

export const getCurrentChatRooms = async (
  userId: string
): Promise<TChatRoomData[]> => {
  try {
    const chatData = await getUserChatRooms(userId);

    const conversations = await Promise.all(
      chatData.map(async (chatroom) => {
        const chatData = await populateForeignColumns(
          chatroom.chatroom_id,
          userId
        );

        const { users, chatrooms, id, user_id, chatroom_id } = chatData;
        const { created_at, last_message } = chatrooms;
        const { image_url, username } = users;

        return {
          id,
          user_id,
          created_at,
          last_message,
          chatroom_id,
          image_url,
          username,
        };
      })
    );

    conversations.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();

      return dateB - dateA;
    });

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

export const deleteChat = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("searched_users")
    .delete()
    .eq("user_id", id);

  if (error) {
    throw new Error(error?.message);
  }
};

export const deleteAllChats = async (id: string): Promise<void> => {
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
    const { error } = await supabase.from("searched_users").insert({
      main_user_id,
      user_id,
    });

    if (error) {
      console.log(error);
    }
  }
};

export const getChatroomId = async (
  userIds: string[]
): Promise<string | undefined> => {
  try {
    const { data, error } = await supabase.rpc("get_chatroom_id", {
      user_ids: userIds,
    });

    if (error) {
      throw new Error(
        `Error executing SQL Procedure: ${JSON.stringify(error)}`
      );
    }

    if (!data || data.length === 0) {
      const chatroomId = await createChatRoom();

      if (chatroomId) {
        for (const user of userIds) {
          await insertChatroomUser(chatroomId, user);
        }

        return chatroomId;
      }
    } else {
      return data[0].chatroom_id;
    }
  } catch (error) {
    console.error(error);
  }
};

export const insertChatroomUser = async (
  chatroomId: string,
  userId: string
): Promise<void> => {
  await supabase.from("chatroom_users").insert({
    chatroom_id: chatroomId,
    user_id: userId,
  });
};

export const createChatRoom = async (): Promise<string> => {
  const { data, error } = await supabase
    .from("chatrooms")
    .insert({ last_message: "" })
    .select("id");

  if (!data) {
    console.log(error.message);
  }

  return data?.[0].id;
};
