"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSeachedUsers = exports.updateUserData = exports.updateUserAvatar = exports.createUser = exports.getUser = void 0;
const supabase_1 = __importDefault(require("../../config/supabase"));
const s3_1 = require("../s3");
const getUser = async ({ data, type }) => {
    if (!data)
        return null;
    const { data: userData, error } = await supabase_1.default
        .from("users")
        .select("*, posts(*)")
        .eq(type, data)
        .order("created_at", { foreignTable: "posts", ascending: false });
    if (error)
        throw new Error(`Error occurred ${error}`);
    if (!userData || userData.length === 0)
        return null;
    // const { error: countError, count } = await supabase
    //   .from("chatroom_users")
    //   .select("*", { count: "exact", head: true })
    //   .eq("is_message_seen", false)
    //   .eq("user_id", userData[0].id);
    // if (countError) {
    //   throw new Error(`Error occurred when getting the count of unread messages ${countError}`);
    // }
    const returnData = { ...userData[0] };
    return returnData;
};
exports.getUser = getUser;
const createUser = async ({ username, email, firstName, lastName }) => {
    const { data, error } = await supabase_1.default
        .from("users")
        .insert({
        username,
        email,
        image_url: null,
        first_name: firstName,
        last_name: lastName,
    })
        .select("*, posts(*)");
    if (error)
        throw new Error(`Error while creating user: ${error.message}`);
    if (!data || data.length === 0) {
        throw new Error("User creation failed");
    }
    console.log("Created new user: ", data);
    return { ...data[0] };
};
exports.createUser = createUser;
const updateUserAvatar = async ({ userId, image_url, }) => {
    const { data: imageUrl } = await supabase_1.default.from("users").select("image_url").eq("id", userId);
    if (imageUrl && imageUrl[0].image_url) {
        await (0, s3_1.deleteS3Object)(imageUrl[0].image_url);
    }
    const { data, error } = await supabase_1.default
        .from("users")
        .update({ image_url })
        .eq("id", userId)
        .select("image_url");
    if (error)
        throw new Error(error.message);
    return data[0].image_url;
};
exports.updateUserAvatar = updateUserAvatar;
const updateUserData = async (userId, userData) => {
    const { data, error } = await supabase_1.default
        .from("users")
        .update({ ...userData })
        .eq("id", userId)
        .select("*");
    if (error)
        return { status: "error", data: error };
    return { status: "success", data: data[0] };
};
exports.updateUserData = updateUserData;
const getSeachedUsers = async (username, searchValue) => {
    const { data: users, error } = await supabase_1.default
        .from("users")
        .select("*")
        .not("username", "eq", username)
        .ilike("username", `${searchValue}%`);
    if (!users)
        throw new Error(error.message);
    return users;
};
exports.getSeachedUsers = getSeachedUsers;
//# sourceMappingURL=user.js.map