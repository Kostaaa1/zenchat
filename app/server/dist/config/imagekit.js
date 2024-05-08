"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purgeImageCache = void 0;
const ImageKit = require("imagekit");
require("dotenv/config");
const { IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT } = process.env;
const imagekit = new ImageKit({
    publicKey: IMAGEKIT_PUBLIC_KEY,
    privateKey: IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: IMAGEKIT_URL_ENDPOINT,
});
const purgeImageCache = async (imageUrl) => {
    imagekit.purgeCache(imageUrl, function (error, result) {
        if (error)
            console.log("Error when purifying the image cahce from imagekit:", error);
        else
            console.log(result);
    });
};
exports.purgeImageCache = purgeImageCache;
//# sourceMappingURL=imagekit.js.map