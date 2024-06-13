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
          const delayTime = Math.pow(2, retries) * 100;
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
