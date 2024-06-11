"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const s3_1 = require("../utils/s3");
const config_1 = require("../config/config");
const utils_1 = require("../utils/utils");
const routers_1 = require("../routers");
exports.default = {
    post: {
        handleImageUpload: async (file, deserialized) => {
            const transcoded = await (0, utils_1.sharpify)(file);
            const { originalname } = transcoded;
            (0, s3_1.uploadToS3)({
                key: transcoded.originalname,
                folder: config_1.s3Buckets.POSTS,
                data: transcoded.buffer,
            });
            const name = (0, s3_1.s3KeyConstructor)({ folder: "posts", name: originalname });
            deserialized["media_url"] = name;
        },
        handleVideoUpload: async (files, deserialized) => {
            const videoFile = files.find((x) => x.mimetype.startsWith("video/"));
            const thumbnailFile = files.find((x) => x.mimetype.startsWith("image/"));
            if (videoFile) {
                (0, s3_1.uploadToS3)({
                    folder: config_1.s3Buckets.POSTS,
                    data: videoFile.buffer,
                    key: videoFile.originalname,
                });
                const { originalname } = videoFile;
                deserialized.media_url = (0, s3_1.s3KeyConstructor)({ folder: "posts", name: originalname });
                if (thumbnailFile) {
                    (0, s3_1.uploadToS3)({
                        folder: config_1.s3Buckets.THUMBNAILS,
                        data: thumbnailFile.buffer,
                        key: thumbnailFile.originalname,
                    });
                    deserialized.thumbnail_url = (0, s3_1.s3KeyConstructor)({
                        folder: "thumbnails",
                        name: thumbnailFile.originalname,
                    });
                }
            }
        },
    },
    avatar: async (req, res) => {
        try {
            console.log("Avatar body: ", JSON.stringify(req.body));
            const file = await (0, utils_1.sharpify)(req.file);
            await (0, s3_1.uploadToS3)({
                folder: config_1.s3Buckets.AVATARS,
                key: file.originalname,
                data: file.buffer,
            });
            const { originalname, size, mimetype } = file;
            const { userId } = JSON.parse(req.body.serialized);
            const s3Url = await (0, routers_1.trpcCaller)({ req, res, session: null }).user.updateAvatar({
                image_url: (0, s3_1.s3KeyConstructor)({ folder: "avatars", name: originalname }),
                userId,
            });
            res.status(200).send(s3Url);
        }
        catch (error) {
            console.log("errorr", error);
            res.status(500).send(`Uploading avatar to S3 failed: ${error}`);
        }
    },
    message: async (req, res) => {
        try {
            const uploadFile = async (file) => {
                const sharpified = await (0, utils_1.sharpify)(file);
                const { buffer, originalname, mimetype, size } = sharpified;
                await (0, s3_1.uploadToS3)({
                    folder: config_1.s3Buckets.MESSAGES,
                    key: originalname,
                    data: buffer,
                });
                return {
                    key: originalname,
                    type: mimetype,
                    size,
                };
            };
            const files = req.files;
            const data = await Promise.all(files.map(async (f) => await uploadFile(f)));
            console.log("Urls", data);
            res.status(200).send({ urls: data });
        }
        catch (error) {
            console.log("Error", error);
            res.status(500).send(`Sending message failed. Error: ${error}`);
        }
    },
};
//# sourceMappingURL=upload.js.map