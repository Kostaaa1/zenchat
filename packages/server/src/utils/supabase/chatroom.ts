import "dotenv/config";
import supabase from "../../config/supabase";
import {
  TMessage,
  TChatroom,
  TChatHistory,
  DbResponse,
  SocketCallUser,
  DbError,
} from "../../types/types";
import { Database } from "../../types/supabase";
import { rooms } from "../../config/initSocket";
import { deleteS3Object, s3KeyConstructor } from "../s3";
import { PostgrestError } from "@supabase/supabase-js";

export const getMessages = async (chatroom_id: string): Promise<DbResponse<TMessage[]>> => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chatroom_id", chatroom_id)
    .order("created_at", {
      ascending: false,
    })
    .limit(22);

  if (error) return { status: "error", data: error };
  return { status: "success", data };
};

export const getMoreMessages = async (
  chatroom_id: string,
  lastMessageDate: string
): Promise<DbResponse<TMessage[]>> => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chatroom_id", chatroom_id)
    .lt("created_at", lastMessageDate)
    .order("created_at", { ascending: false })
    .limit(22);

  if (error) return { status: "error", data: error };
  return { status: "success", data };
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
    if (imageUrl) await deleteS3Object(imageUrl);
  } catch (error) {
    console.log(error);
  }
};

export const sendMessage = async (messageData: TMessage): Promise<DbError | null> => {
  if (messageData.is_image)
    messageData.content = s3KeyConstructor({ folder: "messages", name: messageData.content });
  const { chatroom_id, content, created_at, is_image } = messageData;

  const updates = [
    supabase.from("messages").insert(messageData),
    supabase
      .from("chatrooms")
      .update({
        last_message: is_image ? "Photo" : content,
        created_at,
      })
      .eq("id", chatroom_id),
    supabase
      .from("chatroom_users")
      .update({ is_message_seen: false })
      .eq("chatroom_id", chatroom_id)
      .neq("user_id", messageData.sender_id),
    supabase.from("chatroom_users").update({ is_active: true }).eq("chatroom_id", chatroom_id),
  ];

  const errors: PostgrestError[] = [];
  await Promise.all(
    updates.map(async (t) => {
      const { error } = await t;
      if (error) errors.push(error);
    })
  );

  for (const err in errors) {
    console.log("MESSAGE NOT SENT: ", err);
    return { status: "error", data: errors[0] };
  }

  return null;
};

export const getChatroomData = async (chatroom_id: string): Promise<DbResponse<TChatroom>> => {
  const { data, error } = await supabase
    .from("chatroom_users")
    .select("*, users(username, image_url), chatrooms(last_message, created_at, is_group, admin)")
    .eq("chatroom_id", chatroom_id);

  if (error) return { status: "error", data: error };

  if (!data || !data[0].chatrooms)
    return {
      status: "error",
      data: { code: "500", message: `Could not get the chatrooms`, details: "", hint: "" },
    };

  const chatroomUsers = [];
  for (const item of data) {
    const { users, user_id, id, is_active, is_message_seen } = item;
    if (users) {
      const { image_url, username } = users;
      const is_socket_active = rooms.has(user_id);
      chatroomUsers.push({
        id,
        username,
        image_url,
        is_message_seen,
        user_id,
        is_active,
        is_socket_active,
      });
    }
  }

  const { chatrooms } = data[0];
  const result = {
    chatroom_id,
    ...chatrooms,
    users: chatroomUsers.sort((a, b) => {
      if (a.image_url && b.image_url) {
        return a.image_url.length - b.image_url.length;
      }
      return 0;
    }),
  };

  return { status: "success", data: result };
};

export const getUserChatRooms = async (userId: string): Promise<DbResponse<TChatroom[]>> => {
  const { data: chatroomUsers, error } = await supabase
    .from("chatroom_users")
    .select("chatroom_id")
    .eq("user_id", userId);

  if (error) return { status: "error", data: error };

  const chatrooms: TChatroom[] = [];
  for (const chatroom of chatroomUsers) {
    const { data, status } = await getChatroomData(chatroom.chatroom_id);
    if (status === "error") return { data, status };
    chatrooms.push(data);
  }

  chatrooms.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateB - dateA;
  });

  return { status: "success", data: chatrooms };
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
}): Promise<DbError | null> => {
  const { data: existingData, error: existingError } = await supabase
    .from("searched_users")
    .select("main_user_id")
    .eq("user_id", user_id);

  if (existingError) return { status: "error", data: existingError };
  if (existingData.length === 0) {
    const { error } = await supabase.from("searched_users").insert({
      main_user_id,
      user_id,
    });
    if (error) return { status: "error", data: error };
  }

  return null;
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

export const getChatroomID = async (
  userIds: string[],
  admin: string
): Promise<DbResponse<string>> => {
  const { data, error } = await supabase.rpc("get_chatroom_id", {
    user_ids: userIds,
  });
  if (error) return { data: error, status: "error" };

  if (!data || data.length === 0) {
    const isGroupChat = userIds.length > 2;
    const chatroomId = await createChatRoom(isGroupChat, admin);
    for (const user of userIds) {
      const isActive = user === admin;
      await insertUserChatroom(chatroomId, user, isActive);
    }
    return { status: "success", data: chatroomId };
  } else {
    const { error: err0 } = await supabase
      .from("chatroom_users")
      .update({ is_active: true })
      .eq("chatroom_id", data[0].chatroom_id)
      .eq("user_id", admin);

    if (err0) return { status: "error", data: err0 };
    return { status: "success", data: data[0].chatroom_id };
  }
};

export const getChatroomImages = async (chatroom_id: string): Promise<DbResponse<string[]>> => {
  const { data: images, error } = await supabase
    .from("messages")
    .select("content")
    .eq("chatroom_id", chatroom_id)
    .eq("is_image", true);
  if (error) return { status: "error", data: error };
  return { status: "success", data: images.map((x) => x.content) };
};

export const deleteConversation = async (
  chatroom_id: string,
  user_id: string
): Promise<DbError | null> => {
  const { data, error: e1 } = await supabase
    .from("chatroom_users")
    .select("*")
    .match({ chatroom_id });
  if (e1) return { status: "error", data: e1 };

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

    const { status, data: images } = await getChatroomImages(chatroom_id);
    if (status === "error") return { status: "error", data: images };
    if (images && images.length > 0) {
      await Promise.all(
        images.map(async (img) => {
          await deleteS3Object(img);
        })
      );
    }

    for (const table of tables) {
      const { error } = await deleteRow(table);
      if (error) return { status: "error", data: error };
    }
  } else {
    const { error } = await supabase
      .from("chatroom_users")
      .update({ is_active: false })
      .eq("user_id", user_id)
      .eq("chatroom_id", chatroom_id);

    if (error) return { status: "error", data: error };
  }
  return null;
};

export const getChatroomUsersFromID = async (
  chatroom_id: string
): Promise<DbResponse<SocketCallUser[]>> => {
  const { data, error } = await supabase
    .from("chatroom_users")
    .select("user_id, is_active, users(image_url, username)")
    .eq("chatroom_id", chatroom_id);
  if (error) return { status: "error", data: error };

  const users = data.map((user) => ({
    ...user.users,
    is_active: user.is_active,
    user_id: user.user_id,
  }));
  return { status: "success", data: users };
};

export const triggerReadMessages = async (id: string): Promise<DbError | null> => {
  const { error } = await supabase
    .from("chatroom_users")
    .update({ is_message_seen: true })
    .eq("id", id);

  if (error) return { status: "error", data: error };
  return null;
};
