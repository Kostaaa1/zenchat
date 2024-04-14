import { TRPCError } from "@trpc/server";
import { purgeImageCache } from "../../config/imagekit";
import supabase from "../../config/supabase";
import { deleteImageFromS3 } from "../../middleware/multer";
import { TChatHistory, TMessage, TPopulatedChat, TChatroom } from "../../types/types";
import "dotenv/config";

// Not being used:
// export const getUserIdFromChatroom = async (
//   chatroom_id: string
// ): Promise<{ user_id: string }[]> => {
//   const { data: chatroomData, error } = await supabase
//     .from("chatroom_users")
//     .select("user_id")
//     .eq("chatroom_id", chatroom_id);

//   if (!chatroomData || error) {
//     console.log("Error: ", error);
//     throw new Error(error.message);
//   }

//   return chatroomData;
// };

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
      console.log(
        "This si iamgekit link for purifying: ",
        process.env.IMAGEKIT_URL_ENDPOINT + imageUrl
      );
      await purgeImageCache(process.env.IMAGEKIT_URL_ENDPOINT + imageUrl);
      await deleteImageFromS3({ folder: "messages", file: imageUrl });
    }
  } catch (error) {
    console.log(error);
  }
};

export const deleteConversation = async (chatroom_id: string) => {
  try {
    const { data: images } = await supabase
      .from("messages")
      .select("content")
      .eq("chatroom_id", chatroom_id)
      .eq("isImage", true);

    if (images && images.length > 0) {
      for (const img of images) {
        await deleteImageFromS3({
          folder: "messages",
          file: img.content.split(process.env.IMAGEKIT_URL_ENDPOINT)[1],
        });
      }
    }

    const { error: usersError } = await supabase
      .from("chatroom_users")
      .delete()
      .eq("chatroom_id", chatroom_id);

    if (usersError) {
      console.error("Error deleting chatroom_users: ", usersError);
    }

    const { error: chatroomsError } = await supabase
      .from("chatrooms")
      .delete()
      .eq("chatroom_id", chatroom_id);

    if (chatroomsError) {
      console.error("Error while deleting chat from chatrooms table", chatroomsError);
    }

    const { error } = await supabase.from("messages").delete().eq("chatroom_id", chatroom_id);

    if (error) {
      console.error("Error deleting messages: ", error);
    }
  } catch (error) {
    console.log(error);
  }
};

// Create new message:
export const sendMessage = async (messageData: TMessage) => {
  const { chatroom_id, content, created_at } = messageData;
  const { error: newMessageError } = await supabase.from("messages").insert(messageData);

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
): Promise<TChatroom> => {
  const { data, error } = await supabase
    .from("chatroom_users")
    .select("*, users(username, image_url), chatrooms(last_message, created_at, is_group, admin)")
    .neq("user_id", currentUser_id)
    .eq("chatroom_id", chatroom_id);

  if (!data) {
    throw new Error(
      `Error fetching chat data for chatroom ${chatroom_id}: ${error?.message || "No data"}`
    );
  }

  const populatedData = data as TPopulatedChat[];
  const newUsers = [] as {
    username: string;
    image_url: string;
    user_id: string;
  }[];
  for (const item of populatedData) {
    const { users, user_id } = item;
    const { image_url, username } = users;
    newUsers.push({ username, image_url, user_id });
  }

  const { id, chatrooms } = populatedData[0];
  const { last_message, created_at, is_group, admin } = chatrooms;

  const groupedData = {
    id,
    chatroom_id,
    last_message,
    created_at,
    is_group,
    admin,
    new_message: "",
    img_urls: [],
    users: newUsers,
  };
  return groupedData;
};

export const getCurrentChatroom = async ({
  chatroom_id,
  user_id,
}: {
  chatroom_id: string;
  user_id: string;
}): Promise<TChatroom | undefined> => {
  try {
    const chatData = await populateForeignColumns(chatroom_id, user_id);
    return chatData;
  } catch (error) {
    console.log(error);
  }
};

export const getUserChatRooms = async (userId: string): Promise<TChatroom[]> => {
  try {
    const { data: chatData, error } = await supabase
      .from("chatroom_users")
      .select("chatroom_id")
      .eq("user_id", userId);
    // .or(`sender_id.eq.${userId},messages`);

    if (!chatData) {
      throw new Error(`Error while getting user chatrooms: ${error}`);
    }

    const conversations = await Promise.all(
      chatData.map(async (chatroom) => {
        const s = await populateForeignColumns(chatroom.chatroom_id, userId);
        return s;
      })
    );

    console.log("conversations", conversations);
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

export const getSearchedHistory = async (id: string): Promise<TChatHistory[]> => {
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

export const deleteSearchChat = async (id: string): Promise<void> => {
  const { error } = await supabase.from("searched_users").delete().eq("user_id", id);

  if (error) {
    throw new Error(error?.message);
  }
};

export const deleteAllSearchedChats = async (id: string): Promise<void> => {
  const { error } = await supabase.from("searched_users").delete().eq("main_user_id", id);

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

const createChatRoom = async (is_group: boolean, admin: string): Promise<string> => {
  const { data, error } = await supabase
    .from("chatrooms")
    .insert({ last_message: "", is_group, admin })
    .select("id");

  if (!data) {
    console.log(error.message);
  }

  return data?.[0].id;
};

const inserUserChatroom = async (chatroomId: string, userId: string): Promise<void> => {
  const { error } = await supabase.from("chatroom_users").insert({
    chatroom_id: chatroomId,
    user_id: userId,
  });

  if (error) {
    console.error("Failed inserting chatroom for user!", error);
  }
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

      if (chatroomId) {
        for (const user of userIds) {
          await inserUserChatroom(chatroomId, user);
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
