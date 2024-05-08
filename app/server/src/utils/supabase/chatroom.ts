import { TRPCError } from "@trpc/server";
import { purgeImageCache } from "../../config/imagekit";
import supabase from "../../config/supabase";
import { deleteImageFromS3 } from "../../middleware/multer";
import { TMessage, TChatroom, TChatHistory, TPopulatedChat } from "../../types/types";
import "dotenv/config";
import { Database } from "../../types/supabase";
import { rooms } from "../../config/initSocket";

const { IMAGEKIT_URL_ENDPOINT = "" } = process.env;

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
    .limit(22);

  if (!data) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Error when fetching all messages: ${error.message}`,
    });
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
    const { data, error } = await supabase.from("messages").delete().eq("id", id);
    if (!data) console.log(error);
    if (imageUrl) {
      await purgeImageCache(IMAGEKIT_URL_ENDPOINT + imageUrl);
      await deleteImageFromS3({ folder: "messages", file: imageUrl });
    }
  } catch (error) {
    console.log(error);
  }
};

export const sendMessage = async (messageData: TMessage) => {
  const { chatroom_id, content, created_at } = messageData;
  const { error: newMessageError } = await supabase.from("messages").insert(messageData);
  if (messageData.is_image) return;

  const { error: lastMessageUpdateError } = await supabase
    .from("chatrooms")
    .update({
      last_message: content.length > 34 ? content.slice(0, 34) + "..." : content,
      created_at,
    })
    .eq("id", chatroom_id);

  const { error } = await supabase
    .from("chatroom_users")
    .update({ is_active: true })
    .eq("chatroom_id", chatroom_id)
    .neq("user_id", messageData.sender_id);

  if (error) console.log(error);
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

export const getChatroomData = async (
  chatroom_id: string,
  currentUser_id: string
): Promise<TChatroom> => {
  const { data, error } = await supabase
    .from("chatroom_users")
    .select(
      "*, users(username, image_url), chatrooms(last_message, created_at, is_group, admin, is_read)"
    )
    .eq("chatroom_id", chatroom_id);
  // .neq("user_id", currentUser_id);

  if (!data) {
    throw new Error(
      `Error fetching chat data for chatroom ${chatroom_id}: ${error?.message || "No data"}`
    );
  }

  const chatroomUsers = [];
  for (const item of data) {
    const { users, user_id, is_active } = item;
    const { image_url, username } = users!;
    const is_socket_active = rooms.has(user_id);
    chatroomUsers.push({ username, image_url, user_id, is_active, is_socket_active });
  }
  const { id, chatrooms } = data[0];
  const { last_message, created_at, is_group, admin, is_read } = chatrooms!;

  return {
    id,
    chatroom_id,
    last_message,
    created_at,
    is_group,
    is_read,
    admin,
    users: chatroomUsers.sort((a, y) => a.image_url!.length - y.image_url!.length),
  };
};

export const getUserChatRooms = async (userId: string): Promise<TChatroom[]> => {
  try {
    const { data: chatData, error } = await supabase
      .from("chatroom_users")
      .select("chatroom_id")
      .eq("user_id", userId);
    // .eq("is_active", true);

    if (!chatData) {
      throw new Error(`Error while getting user chatrooms: ${error}`);
    }
    const chatrooms = await Promise.all(
      chatData.map(async (chatroom) => {
        const s = await getChatroomData(chatroom.chatroom_id, userId);
        return s;
      })
    );

    chatrooms.sort((a, b) => {
      const dateA = new Date(a!.created_at).getTime();
      const dateB = new Date(b!.created_at).getTime();
      return dateB - dateA;
    });

    return chatrooms;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getSearchedHistory = async (id: string): Promise<TChatHistory[]> => {
  try {
    const { data, error } = await supabase
      .from("searched_users")
      .select("*, users(username, image_url, first_name, last_name)")
      .eq("main_user_id", id)
      .order("created_at", { ascending: false });

    if (!data) throw new Error(error.message);
    return data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const deleteSearchChat = async (id: string): Promise<void> => {
  const { error } = await supabase.from("searched_users").delete().eq("user_id", id);
  if (error) {
    throw new Error(error?.message);
  }
};

export const deleteAllSearchedChats = async (id: string): Promise<void> => {
  const { error } = await supabase.from("searched_users").delete().eq("main_user_id", id);
  if (error) console.log(error);
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
    if (error) console.log(error);
  }
};

export const createChatRoom = async (is_group: boolean, admin: string): Promise<string> => {
  const { data, error } = await supabase
    .from("chatrooms")
    .insert({ last_message: "", is_group, admin })
    .select("id");
  const requiredId = data?.[0].id;
  if (!data || !requiredId) throw new Error(error?.message);
  return requiredId;
};

export const insertUserChatroom = async (
  chatroomId: string,
  userId: string,
  isActive: boolean
): Promise<void> => {
  const { error } = await supabase.from("chatroom_users").insert({
    chatroom_id: chatroomId,
    user_id: userId,
    is_active: isActive,
  });
  if (error) console.error("Failed inserting chatroom for user!", error);
};

export const getChatroomId = async (
  userIds: string[],
  admin: string
): Promise<string | undefined> => {
  try {
    const { data, error } = await supabase.rpc("get_chatroom_id", {
      user_ids: userIds,
    });

    if (error) {
      throw new Error(`Error executing SQL Procedure: ${JSON.stringify(error)}`);
    }

    if (!data || data.length === 0) {
      const isGroupChat = userIds.length > 2;
      const chatroomId = await createChatRoom(isGroupChat, admin);
      for (const user of userIds) {
        const isActive = user === admin;
        await insertUserChatroom(chatroomId, user, isActive);
      }
      return chatroomId;
    } else {
      return data[0].chatroom_id;
    }
  } catch (error) {
    console.error(error);
  }
};

export const deleteConversation = async (chatroom_id: string, user_id: string) => {
  try {
    const { data } = await supabase.from("chatroom_users").select("*").match({ chatroom_id });
    if (data && data.filter((x) => x.is_active).length === 1) {
      const tables: (keyof Database["public"]["Tables"])[] = [
        "chatroom_users",
        "messages",
        "chatrooms",
      ];

      async function deleteRow(table: keyof Database["public"]["Tables"]) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq(table === "chatrooms" ? "id" : "chatroom_id", chatroom_id);
        return { error, table };
      }

      try {
        // Delete s3 messages that blonged to room???
        const { data: images } = await supabase
          .from("messages")
          .select("content")
          .eq("chatroom_id", chatroom_id)
          .eq("is_image", true);

        if (images && images.length > 0) {
          for (const img of images) {
            await deleteImageFromS3({
              folder: "messages",
              file: img.content.split("")[1],
            });
          }
        }

        for (const table of tables) {
          const res = await deleteRow(table);
          res.error
            ? console.log(`Error deleting from ${table}:`, res.error)
            : console.log("Deleted successfull", chatroom_id);
        }
      } catch (error) {
        console.error("Unexpected error when deleting last field", error);
      }
    } else {
      // soft delete:
      await supabase.from("chatroom_users").update({ is_active: false }).eq("user_id", user_id);
    }
  } catch (error) {
    console.log(error);
  }
};
