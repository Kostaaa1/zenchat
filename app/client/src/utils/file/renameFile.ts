import { nanoid } from "nanoid";

export const renameFile = (
  fileImage: File,
  chatroom_id?: string,
  cb?: (file: File) => void,
): File => {
  const uniquePrefix = nanoid();
  const chatroomPrefix = chatroom_id?.split("-")[0] || null;
  const filename = [chatroomPrefix, uniquePrefix, fileImage.name]
    .filter(Boolean)
    .join("-");

  const newFile = new File([fileImage], filename, { type: fileImage.type });
  if (cb) cb(newFile);
  return newFile;
};
