"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sharpify = void 0;
const sharp_1 = __importDefault(require("sharp"));
const sharpify = async (file) => {
    try {
        const { buffer, mimetype } = file;
        if (mimetype.startsWith("image/")) {
            const format = mimetype.split("/")[1];
            const supportedFormats = ["jpeg", "jpg", "webp", "png", "avif", "tiff"];
            if (supportedFormats.includes(format)) {
                file.buffer = await (0, sharp_1.default)(buffer)
                    .resize({ width: 800 })
                    .toFormat(format, { quality: 90 })
                    .toBuffer();
            }
        }
        return file;
    }
    catch (error) {
        console.log("error while optimizing the image with sharp");
        return file;
    }
};
exports.sharpify = sharpify;
//# sourceMappingURL=utils.js.map