"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const _1 = require(".");
const multer_1 = __importDefault(require("multer"));
const uploadRouter = express_1.default.Router();
const upload_1 = __importDefault(require("../controllers/upload"));
const upload = (0, multer_1.default)();
const uploadPost = async (req, res, fileType) => {
    const { file, files, body } = req;
    if (!file && !files)
        return res.status(400).json({ error: "No file provided" });
    if (!body)
        return res.status(400).json({ error: "No body provided" });
    const { serialized } = body;
    const deserialized = JSON.parse(serialized);
    if (fileType === "image" && file) {
        await upload_1.default.post.handleImageUpload(file, deserialized);
    }
    else if (fileType === "video" && files) {
        const multerFiles = files;
        await upload_1.default.post.handleVideoUpload(multerFiles, deserialized);
    }
    try {
        const uploadedData = await (0, _1.trpcCaller)({ req, res, session: null }).posts.upload(deserialized);
        return res.status(200).json(uploadedData);
    }
    catch (error) {
        console.error("Error during POSTs file upload.", error);
        return res.status(500).json({ error: "Uploading POST failed." });
    }
};
uploadRouter.post("/post/image", upload.single("post"), async (req, res) => {
    await uploadPost(req, res, "image");
});
uploadRouter.post("/post/video", upload.array("post"), async (req, res) => {
    await uploadPost(req, res, "video");
});
uploadRouter.post("/avatar", upload.single("images"), upload_1.default.avatar);
uploadRouter.post("/message", upload.array("images"), upload_1.default.message);
exports.default = uploadRouter;
//# sourceMappingURL=upload.js.map