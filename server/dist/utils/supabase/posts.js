"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.uploadPost = void 0;
const supabase_1 = __importDefault(require("../../config/supabase"));
const uploadPost = async (uploadData) => {
    const { data, error } = await supabase_1.default.from("posts").insert(uploadData).select("*");
    if (error || data.length === 0)
        throw new Error(`Error while inserting a post: ${error}`);
    return data[0];
};
exports.uploadPost = uploadPost;
const deletePost = async (id) => {
    const { error } = await supabase_1.default.from("posts").delete().eq("id", id);
    if (error)
        throw new Error(`Error while deletin post ${error}`);
};
exports.deletePost = deletePost;
//# sourceMappingURL=posts.js.map