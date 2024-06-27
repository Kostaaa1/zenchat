"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerReadMessages = exports.getChatroomUsersFromID = exports.deleteConversation = exports.getChatroomImages = exports.getChatroomID = exports.insertUserChatroom = exports.createChatRoom = exports.addUserToChatHistory = exports.deleteAllSearchedChats = exports.deleteSearchChat = exports.getSearchedHistory = exports.getUserChatRooms = exports.getChatroomData = exports.sendMessage = exports.unsendMessage = exports.getMoreMessages = exports.getMessages = void 0;
require("dotenv/config");
const supabase_1 = __importDefault(require("../../config/supabase"));
const initSocket_1 = require("../../config/initSocket");
const s3_1 = require("../s3");
const getMessages = async (chatroom_id) => {
    const { data, error } = await supabase_1.default
        .from("messages")
        .select("*")
        .eq("chatroom_id", chatroom_id)
        .order("created_at", {
        ascending: false,
    })
        .limit(22);
    if (error)
        return { status: "error", data: error };
    return { status: "success", data };
};
exports.getMessages = getMessages;
const getMoreMessages = async (chatroom_id, lastMessageDate) => {
    const { data, error } = await supabase_1.default
        .from("messages")
        .select("*")
        .eq("chatroom_id", chatroom_id)
        .lt("created_at", lastMessageDate)
        .order("created_at", { ascending: false })
        .limit(22);
    if (error)
        return { status: "error", data: error };
    return { status: "success", data };
};
exports.getMoreMessages = getMoreMessages;
const unsendMessage = async ({ id, imageUrl, }) => {
    try {
        const { data, error } = await supabase_1.default.from("messages").delete().eq("id", id);
        if (!data)
            console.log(error);
        if (imageUrl)
            await (0, s3_1.deleteS3Object)(imageUrl);
    }
    catch (error) {
        console.log(error);
    }
};
exports.unsendMessage = unsendMessage;
const sendMessage = async (messageData) => {
    if (messageData.is_image)
        messageData.content = (0, s3_1.s3KeyConstructor)({ folder: "messages", name: messageData.content });
    const { chatroom_id, content, created_at, is_image } = messageData;
    const updates = [
        supabase_1.default.from("messages").insert(messageData),
        supabase_1.default
            .from("chatrooms")
            .update({
            last_message: is_image ? "Photo" : content,
            created_at,
        })
            .eq("id", chatroom_id),
        supabase_1.default
            .from("chatroom_users")
            .update({ is_message_seen: false })
            .eq("chatroom_id", chatroom_id)
            .neq("user_id", messageData.sender_id),
        supabase_1.default.from("chatroom_users").update({ is_active: true }).eq("chatroom_id", chatroom_id),
    ];
    const errors = [];
    await Promise.all(updates.map(async (t) => {
        const { error } = await t;
        if (error)
            errors.push(error);
    }));
    for (const err in errors) {
        console.log("MESSAGE NOT SENT: ", err);
        return { status: "error", data: errors[0] };
    }
    return null;
};
exports.sendMessage = sendMessage;
const getChatroomData = async (chatroom_id) => {
    const { data, error } = await supabase_1.default
        .from("chatroom_users")
        .select("*, users(username, image_url), chatrooms(last_message, created_at, is_group, admin)")
        .eq("chatroom_id", chatroom_id);
    if (error)
        return { status: "error", data: error };
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
            const is_socket_active = initSocket_1.rooms.has(user_id);
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
exports.getChatroomData = getChatroomData;
const getUserChatRooms = async (userId) => {
    const { data: chatroomUsers, error } = await supabase_1.default
        .from("chatroom_users")
        .select("chatroom_id")
        .eq("user_id", userId);
    if (error)
        return { status: "error", data: error };
    const chatrooms = [];
    for (const chatroom of chatroomUsers) {
        const { data, status } = await (0, exports.getChatroomData)(chatroom.chatroom_id);
        if (status === "error")
            return { data, status };
        chatrooms.push(data);
    }
    chatrooms.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
    });
    return { status: "success", data: chatrooms };
};
exports.getUserChatRooms = getUserChatRooms;
const getSearchedHistory = async (id) => {
    try {
        const { data, error } = await supabase_1.default
            .from("searched_users")
            .select("*, users(username, image_url, first_name, last_name)")
            .eq("main_user_id", id)
            .order("created_at", { ascending: false });
        if (!data)
            throw new Error(error.message);
        return data;
    }
    catch (error) {
        console.log(error);
        return [];
    }
};
exports.getSearchedHistory = getSearchedHistory;
const deleteSearchChat = async (id) => {
    const { error } = await supabase_1.default.from("searched_users").delete().eq("user_id", id);
    if (error) {
        throw new Error(error?.message);
    }
};
exports.deleteSearchChat = deleteSearchChat;
const deleteAllSearchedChats = async (id) => {
    const { error } = await supabase_1.default.from("searched_users").delete().eq("main_user_id", id);
    if (error)
        console.log(error);
};
exports.deleteAllSearchedChats = deleteAllSearchedChats;
const addUserToChatHistory = async ({ main_user_id, user_id, }) => {
    const { data: existingData, error: existingError } = await supabase_1.default
        .from("searched_users")
        .select("main_user_id")
        .eq("user_id", user_id);
    if (existingError)
        return { status: "error", data: existingError };
    if (existingData.length === 0) {
        const { error } = await supabase_1.default.from("searched_users").insert({
            main_user_id,
            user_id,
        });
        if (error)
            return { status: "error", data: error };
    }
    return null;
};
exports.addUserToChatHistory = addUserToChatHistory;
const createChatRoom = async (is_group, admin) => {
    const { data, error } = await supabase_1.default
        .from("chatrooms")
        .insert({ last_message: "", is_group, admin })
        .select("id");
    const requiredId = data?.[0].id;
    if (!data || !requiredId)
        throw new Error(error?.message);
    return requiredId;
};
exports.createChatRoom = createChatRoom;
const insertUserChatroom = async (chatroomId, userId, isActive) => {
    const { error } = await supabase_1.default.from("chatroom_users").insert({
        chatroom_id: chatroomId,
        user_id: userId,
        is_active: isActive,
    });
    if (error)
        console.error("Failed inserting chatroom for user!", error);
};
exports.insertUserChatroom = insertUserChatroom;
const getChatroomID = async (userIds, admin) => {
    const { data, error } = await supabase_1.default.rpc("get_chatroom_id", {
        user_ids: userIds,
    });
    if (error)
        return { data: error, status: "error" };
    if (!data || data.length === 0) {
        const isGroupChat = userIds.length > 2;
        const chatroomId = await (0, exports.createChatRoom)(isGroupChat, admin);
        for (const user of userIds) {
            const isActive = user === admin;
            await (0, exports.insertUserChatroom)(chatroomId, user, isActive);
        }
        return { status: "success", data: chatroomId };
    }
    else {
        const { error: err0 } = await supabase_1.default
            .from("chatroom_users")
            .update({ is_active: true })
            .eq("chatroom_id", data[0].chatroom_id)
            .eq("user_id", admin);
        if (err0)
            return { status: "error", data: err0 };
        return { status: "success", data: data[0].chatroom_id };
    }
};
exports.getChatroomID = getChatroomID;
const getChatroomImages = async (chatroom_id) => {
    const { data: images, error } = await supabase_1.default
        .from("messages")
        .select("content")
        .eq("chatroom_id", chatroom_id)
        .eq("is_image", true);
    if (error)
        return { status: "error", data: error };
    return { status: "success", data: images.map((x) => x.content) };
};
exports.getChatroomImages = getChatroomImages;
const deleteConversation = async (chatroom_id, user_id) => {
    const { data, error: e1 } = await supabase_1.default
        .from("chatroom_users")
        .select("*")
        .match({ chatroom_id });
    if (e1)
        return { status: "error", data: e1 };
    if (data && data.filter((x) => x.is_active).length === 1) {
        const tables = [
            "chatroom_users",
            "messages",
            "chatrooms",
        ];
        async function deleteRow(table) {
            const { error } = await supabase_1.default
                .from(table)
                .delete()
                .eq(table === "chatrooms" ? "id" : "chatroom_id", chatroom_id);
            return { error, table };
        }
        const { status, data: images } = await (0, exports.getChatroomImages)(chatroom_id);
        if (status === "error")
            return { status: "error", data: images };
        if (images && images.length > 0) {
            await Promise.all(images.map(async (img) => {
                await (0, s3_1.deleteS3Object)(img);
            }));
        }
        for (const table of tables) {
            const { error } = await deleteRow(table);
            if (error)
                return { status: "error", data: error };
        }
    }
    else {
        const { error } = await supabase_1.default
            .from("chatroom_users")
            .update({ is_active: false })
            .eq("user_id", user_id)
            .eq("chatroom_id", chatroom_id);
        if (error)
            return { status: "error", data: error };
    }
    return null;
};
exports.deleteConversation = deleteConversation;
const getChatroomUsersFromID = async (chatroom_id) => {
    const { data, error } = await supabase_1.default
        .from("chatroom_users")
        .select("user_id, is_active, users(image_url, username)")
        .eq("chatroom_id", chatroom_id);
    if (error)
        return { status: "error", data: error };
    const users = data.map((user) => ({
        ...user.users,
        is_active: user.is_active,
        user_id: user.user_id,
    }));
    return { status: "success", data: users };
};
exports.getChatroomUsersFromID = getChatroomUsersFromID;
const triggerReadMessages = async (id) => {
    const { error } = await supabase_1.default
        .from("chatroom_users")
        .update({ is_message_seen: true })
        .eq("id", id);
    if (error)
        return { status: "error", data: error };
    return null;
};
exports.triggerReadMessages = triggerReadMessages;
//# sourceMappingURL=chatroom.js.map