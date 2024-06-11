export const generateThumbnailFile = (
  videoUrl: string,
  tmbName: string,
): Promise<{ file: File; url: string }> => {
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
