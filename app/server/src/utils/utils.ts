import sharp from "sharp";

type SharpFormat = keyof sharp.FormatEnum | sharp.AvailableFormatInfo;

export const sharpify = async (file: Express.Multer.File): Promise<Express.Multer.File> => {
  try {
    const { buffer, mimetype } = file;
    if (mimetype.startsWith("image/")) {
      const format = mimetype.split("/")[1] as SharpFormat;
      const supportedFormats: SharpFormat[] = ["jpeg", "jpg", "webp", "png", "avif", "tiff"];

      if (supportedFormats.includes(format)) {
        file.buffer = await sharp(buffer)
          .resize({ width: 800 })
          .toFormat(format, { quality: 90 })
          .toBuffer();
      }
    }
    return file;
  } catch (error) {
    console.log("error while optimizing the image with sharp");
    return file;
  }
};
