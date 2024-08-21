"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Buckets = exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envs = [
    "PORT",
    "SUPABASE_API_URL",
    "SUPABASE_API_KEY",
    "AWS_REGION",
    "AWS_ACCESS_KEY_ID",
    "AWS_BUCKET_URL",
    "AWS_BUCKETNAME",
    "AWS_SECRET_ACCESS_KEY",
];
const s3Buckets = {
    AVATARS: "avatars",
    MESSAGES: "messages",
    POSTS: "posts",
    THUMBNAILS: "thumbnails",
}; // Using 'as const' to make the values readonly and preserve the literal types
exports.s3Buckets = s3Buckets;
const processenv = () => {
    const missingVars = envs.filter((x) => !process.env[x]);
    if (missingVars.length > 0) {
        console.error(`Missing required env variables. Please add them to .env file: ${missingVars}`);
        process.exit(1);
    }
    const map = {};
    envs.forEach((x) => {
        const e = process.env[x];
        if (e)
            map[x] = e;
    });
    return map;
};
const env = processenv();
exports.env = env;
//# sourceMappingURL=config.js.map