import { ClassValue, clsx } from "clsx";
import { nanoid } from "nanoid";
import { twMerge } from "tailwind-merge";
import { TMessage } from "../../../server/src/types/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const loadImage = async (url: string, maxRetries = 5) => {
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const loadImageWithRetry = async (url: string, retries = 0) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        resolve(true);
      };
      img.onerror = async (err) => {
        console.log("Error loading image: ", url, err);
        if (retries < maxRetries) {
          const delayTime = Math.pow(2, retries) * 100; // Exponential backoff
          console.log(
            `Retrying in ${delayTime}ms... (Attempt ${
              retries + 1
            }/${maxRetries})`,
          );
          await delay(delayTime);
          resolve(loadImageWithRetry(url, retries + 1));
        } else {
          console.log("Max retries reached. Failed to load image.");
          resolve(false);
        }
      };
    });
  };

  return loadImageWithRetry(url);
};

export const isImage = (type: string) => {
  return type.split("/")[0] === "image";
};

export const getMediaType = (type: string) => {
  if (type.startsWith("image/")) {
    return "image";
  } else if (type.startsWith("video/")) {
    return "video";
  } else {
    return "image";
  }
};

export const loadImagesAndStructureMessages = (
  messages: TMessage[],
): Promise<TMessage[]> => {
  return Promise.all(
    messages.map((data) => {
      const src = data.content;
      return new Promise<TMessage>((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve({ ...data, content: img.currentSrc });
      });
    }),
  );
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

// ?????????
// export const uploadMultipartForm = async (
//   apiUrl: string,
//   formData: FormData,
//   getToken: (options?: GetTokenOptions | undefined) => Promise<string | null>,
// ): Promise<string[]> => {
//   try {
//     const newImages = await axios.post(apiUrl, formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//         Authorization: `Bearer ${await getToken()}`,
//       },
//     });
//     const uploadedImages = newImages.data.urls.map(
//       (x: { key: string }) => x.key,
//     );
//     return uploadedImages;
//   } catch (error) {
//     console.log(error);
//     return [];
//   }
// };

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

export const snapImage = (video: HTMLVideoElement, url: string) => {
  const canvas = document.createElement("canvas");
  canvas.height = video.height;
  canvas.width = video.width;
  canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);

  const image = canvas.toDataURL();
  const success = image.length > 100000;
  if (success) {
    const img = document.createElement("img");
    img.src = image;
    const div = document.getElementById("custom-id");
    div!.appendChild(img);
    URL.revokeObjectURL(url);
  }

  return success;
};

export const convertBytes = (bytes: number) => {
  const KB = bytes / 1024;
  const MB = KB / 1024;

  const result = {
    bytes: bytes.toString(),
    KB: KB.toFixed(2),
    MB: MB.toFixed(2),
  };

  const index = Object.entries(result).findIndex((x) => x[1][0] === "0");
  const output = Object.entries(result)[index - 1];
  return output[1];
};

export const generateThumbnailFile = (
  videoUrl: string,
  tmbName: string,
): Promise<{ file: File; url: string }> => {
  console.log("generating thumbnail called");
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const handleLoadedData = () => {
      const canvas = document.createElement("canvas");
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const newFile = new File([blob], tmbName, { type: "image/jpeg" });
            cleanup();
            canvas.remove();
            const thumbnailUrl = URL.createObjectURL(blob);
            resolve({ file: newFile, url: thumbnailUrl });
          } else {
            cleanup();
            canvas.remove();
            reject(new Error("Failed to create blob from canvas."));
          }
        }, "image/jpeg");
      } else {
        cleanup();
        canvas.remove();
        reject(new Error("Failed to get canvas context."));
      }
    };

    const handleError = (err: ErrorEvent) => {
      cleanup();
      reject(err);
    };

    const cleanup = () => {
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("error", handleError);
      URL.revokeObjectURL(video.src);
      video.remove();
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("error", handleError);

    video.src = videoUrl;
    video.currentTime = 0.1;
  });
};
