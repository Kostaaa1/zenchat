"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = require("../middleware/multer");
const _1 = require(".");
const uploadRouter = express_1.default.Router();
const { IMAGEKIT_URL_ENDPOINT = "" } = process.env;
uploadRouter.post("/post", multer_1.uploadPostImage.array("uploadPost"), async (req, res) => {
    if (!req.files)
        return;
    const { serialized } = req.body;
    // @ts-expect-error idk
    const file = req.files[0];
    const deserialized = JSON.parse(serialized);
    deserialized["media_name"] = file.originalname;
    deserialized["media_url"] = IMAGEKIT_URL_ENDPOINT + file.originalname;
    const uploadedData = await (0, _1.trpcCaller)({ req, res, session: null }).posts.upload(deserialized);
    res.status(200).json(uploadedData);
});
uploadRouter.post("/avatar", multer_1.uploadAvatar.array("images"), (req, res) => {
    res.send({
        urls: req.files.map((file) => {
            const { originalname, size, mimetype } = file;
            return {
                key: originalname,
                type: mimetype,
                size,
            };
        }),
    });
});
uploadRouter.post("/message", multer_1.uploadMessageImage.array("images"), (req, res) => {
    res.send({
        urls: req.files.map((file) => {
            const { originalname, size, mimetype } = file;
            return {
                key: originalname,
                type: mimetype,
                size,
            };
        }),
    });
});
exports.default = uploadRouter;
//# sourceMappingURL=upload.js.map