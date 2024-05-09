"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.getSeachedUsers = exports.updateUserData = exports.updateUserAvatar = exports.getUser = void 0;
const supabase_1 = __importDefault(require("../../config/supabase"));
const multer_1 = require("../../middleware/multer");
const getUser = async ({ data, type }) => {
    if (!data)
        return null;
    const { data: userData, error } = await supabase_1.default
        .from("users")
        .select("*, posts(*)")
        .eq(type, data);
    if (error) {
        throw new Error(`Error occured ${error}`);
    }
    return userData[0] || null;
};
exports.getUser = getUser;
const updateUserAvatar = async ({ userId, image_url, }) => {
    const { data: imageUrl } = await supabase_1.default.from("users").select("image_url").eq("id", userId);
    if (imageUrl?.[0].image_url) {
        await (0, multer_1.deleteImageFromS3)({ folder: "avatars", file: imageUrl[0].image_url });
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
    console.log("To update: ", userId, "Data: ", userData);
    const { data, error } = await supabase_1.default
        .from("users")
        .update({ ...userData })
        .eq("id", userId)
        .select("*");
    if (error)
        return { success: false, message: error.message };
    return { success: true, data: data[0] };
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
const createUser = async ({ username, email, firstName, lastName, }) => {
    const { data, error } = await supabase_1.default
        .from("users")
        .insert({
        username,
        email,
        image_url: "",
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
    return data[0];
};
exports.createUser = createUser;
//# sourceMappingURL=user.js.map