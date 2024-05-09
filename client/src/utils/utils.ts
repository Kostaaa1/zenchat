import { GetTokenOptions } from "@clerk/types";
import axios from "axios";
import { ClassValue, clsx } from "clsx";
import { nanoid } from "nanoid";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const loadImage = async (url: string) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      // setIsAvatarUpdating(false);
      resolve(true);
    };

    img.onerror = () => {
      reject(false);
    };
  });
};

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

export const uploadMultipartForm = async (
  apiUrl: string,
  formData: FormData,
  getToken: (options?: GetTokenOptions | undefined) => Promise<string | null>,
): Promise<string[]> => {
  try {
    const newImages = await axios.post(apiUrl, formData, {
      // withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${await getToken()}`,
      },
    });
    const uploadedImages = newImages.data.urls.map(
      (x: { key: string }) => x.key,
    );
    return uploadedImages;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export function convertAndFormatDate(dateString: string) {
  const date = new Date(dateString);
  const dayOptions = { weekday: "short" };
  const timeOptions = { hour: "numeric", minute: "numeric", hour12: true };
  // @ts-expect-error sko
  const dayOfWeek = date.toLocaleDateString("en-US", dayOptions);
  // @ts-expect-error sko
  const formattedTime = date.toLocaleTimeString("en-US", timeOptions);
  const result = `${dayOfWeek} ${formattedTime}`;
  return result;
}
