"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRoomDataSchema = exports.MessageSchema = exports.CreateUserSchema = exports.UserSchema = exports.PostSchema = exports.OutputPostSchema = exports.InputPostSchema = void 0;
const zod_1 = require("zod");
exports.InputPostSchema = zod_1.z.object({
    caption: zod_1.z.string(),
    media_name: zod_1.z.string(),
    media_url: zod_1.z.string(),
    user_id: zod_1.z.string(),
});
exports.OutputPostSchema = zod_1.z.object({
    id: zod_1.z.string(),
    created_at: zod_1.z.string(),
});
exports.PostSchema = exports.InputPostSchema.merge(exports.OutputPostSchema);
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.string(),
    created_at: zod_1.z.string(),
    username: zod_1.z.string(),
    email: zod_1.z.string(),
    image_url: zod_1.z.string(),
    first_name: zod_1.z.string(),
    last_name: zod_1.z.string(),
    description: zod_1.z.string(),
    posts: zod_1.z.array(exports.PostSchema),
});
exports.CreateUserSchema = zod_1.z.object({
    username: zod_1.z.string(),
    firstName: zod_1.z.string(),
    lastName: zod_1.z.string(),
    email: zod_1.z.string(),
});
exports.MessageSchema = zod_1.z.object({
    id: zod_1.z.string(),
    sender_id: zod_1.z.string(),
    chatroom_id: zod_1.z.string(),
    content: zod_1.z.string(),
    created_at: zod_1.z.string(),
    is_image: zod_1.z.boolean(),
});
exports.ChatRoomDataSchema = zod_1.z.object({
    id: zod_1.z.string(),
    chatroom_id: zod_1.z.string(),
    created_at: zod_1.z.string(),
    user_id: zod_1.z.string(),
    last_message: zod_1.z.string(),
    image_url: zod_1.z.string(),
    username: zod_1.z.string(),
    messages: zod_1.z.array(exports.MessageSchema),
    is_group: zod_1.z.boolean(),
});
//# sourceMappingURL=zodSchemas.js.map