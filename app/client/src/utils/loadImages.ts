import { TMessage } from "../../../server/src/types/types";

export const loadImagesAndStructureMessages = (
  messages: TMessage[],
): Promise<TMessage[]> => {
  return Promise.all(
    messages.map((data) => {
      if (!data.is_image) return data;
      const src = data.content;

      return new Promise<TMessage>((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve({ ...data, content: img.currentSrc });
      });
    }),
  );
};
