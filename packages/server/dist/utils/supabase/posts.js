"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.uploadPost = void 0;
const supabase_1 = __importDefault(require("../../config/supabase"));
const s3_1 = require("../s3");
const uploadPost = async (uploadData) => {
    const { data, error } = await supabase_1.default
        .from("posts")
        .insert(uploadData)
        .select("*");
    return { data: data[0], error };
};
exports.uploadPost = uploadPost;
const deletePost = async (id, fileKeys) => {
    try {
        // console.log("fileKeys", fileKeys);
        // Delete post from database
        const { error: dbError } = await supabase_1.default.from("posts").delete().eq("id", id);
        if (dbError) {
            console.error("Error deleting post from database:", dbError);
            return { success: false, error: dbError };
        }
        // Max 2 iterations (thumbnail and video)
        for (const key of fileKeys) {
            await (0, s3_1.deleteS3Object)(key, "posts");
        }
        return { success: true };
    }
    catch (err) {
        console.error("Unexpected error:", err);
        // @ts-expect-error
        return { success: false, error: err.message || err };
    }
};
exports.deletePost = deletePost;
//# sourceMappingURL=posts.js.map