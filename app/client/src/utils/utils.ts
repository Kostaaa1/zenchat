import axios from "axios";
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const uploadImage = async (
  api_url: string,
  formData: FormData,
): Promise<string[]> => {
  try {
    const newImages = await axios.post(api_url, formData, {
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
