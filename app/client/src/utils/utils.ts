import axios from "axios";
import { ClassValue, clsx } from "clsx";
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

export const uploadMultipartForm = async (
  apiUrl: string,
  formData: FormData,
): Promise<string[]> => {
  try {
    const newImages = await axios.post(apiUrl, formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
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
