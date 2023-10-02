import { TMessage } from "../../../server/src/types/types";

export const loadImages = (imageUrls: TMessage[]): Promise<TMessage[]> => {
  return Promise.all(
    imageUrls.map((data) => {
      if (!data.isImage) return data;

      const src = data.content;
      return new Promise<TMessage>((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve({ ...data, content: img.currentSrc });
      });
    }),
  );
};
