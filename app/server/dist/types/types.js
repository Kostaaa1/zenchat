"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = __importDefault(require("../config/supabase"));
const chatHistory = supabase_1.default
    .from("searched_users")
    .select("*, users(username, image_url, first_name, last_name)");
const userWithPosts = supabase_1.default.from("users").select("*, posts(*)");
const populatedChat = supabase_1.default
    .from("chatroom_users")
    .select("*, users(username, image_url), chatrooms(last_message, created_at, is_group, admin)");
//# sourceMappingURL=types.js.map