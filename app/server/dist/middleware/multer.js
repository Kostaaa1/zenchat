"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPostImage = exports.uploadMessageImage = exports.uploadAvatar = exports.deleteImageFromS3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
require("dotenv/config");
const { AWS_REGION, AWS_ACCESS_KEY_ID = "", AWS_SECRET_ACCESS_KEY = "", AWS_S3_BUCKETNAME = "", IMAGEKIT_URL_ENDPOINT, } = process.env;
const s3 = new client_s3_1.S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
});
const deleteImageFromS3 = async ({ folder, file }) => {
    try {
        const removePrefixer = file.split(IMAGEKIT_URL_ENDPOINT);
        console.log("file for deletion from S3: ", removePrefixer);
        const params = {
            Bucket: AWS_S3_BUCKETNAME,
            Key: `${folder}/${removePrefixer.length > 1 ? removePrefixer[1] : file}`,
        };
        const deleteCommand = new client_s3_1.DeleteObjectCommand(params);
        await s3.send(deleteCommand);
        console.log(`File ${file} deleted successfully !`);
    }
    catch (error) {
        console.log(error);
    }
};
exports.deleteImageFromS3 = deleteImageFromS3;
const uploadAvatar = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3,
        bucket: AWS_S3_BUCKETNAME,
        key: (req, file, cb) => {
            const fullPath = "avatars/" + file.originalname;
            cb(null, fullPath);
        },
    }),
});
exports.uploadAvatar = uploadAvatar;
const uploadMessageImage = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3,
        bucket: AWS_S3_BUCKETNAME,
        key: (req, file, cb) => {
            const fullPath = "messages/" + file.originalname;
            cb(null, fullPath);
        },
    }),
});
exports.uploadMessageImage = uploadMessageImage;
const uploadPostImage = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3,
        bucket: AWS_S3_BUCKETNAME,
        key: (req, file, cb) => {
            const fullPath = "posts/" + file.originalname;
            cb(null, fullPath);
        },
    }),
});
exports.uploadPostImage = uploadPostImage;
//# sourceMappingURL=multer.js.map