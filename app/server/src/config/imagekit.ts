const ImageKit = require("imagekit");
import "dotenv/config";

const { IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT } =
  process.env;

const imagekit = new ImageKit({
  publicKey: IMAGEKIT_PUBLIC_KEY,
  privateKey: IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: IMAGEKIT_URL_ENDPOINT,
});

export const purgeImageCache = async (imageUrl: string) => {
  imagekit.purgeCache(imageUrl, function (error: any, result: any) {
    if (error)
      console.log("Error when purifying the image cahce from imagekit:", error);
    else console.log(result);
  });
};
