import { create } from "zustand";

type ChatStore = {
  inputMessages: Map<string, string>;
  inputImages: Map<string, string[]>;
  actions: {
    addChatInputMessage: (chatroomId: string, text: string) => void;
    addChatInputImage: (chatroomId: string, text: string) => void;
    //////////////
    removeChatInputImage: (chatroomId: string, id: number) => void;
  };
};

const useChatMapStore = create<ChatStore>(
  (set): ChatStore => ({
    inputMessages: new Map(),
    inputImages: new Map(),
    actions: {
      addChatInputMessage: (chatroomId: string, text: string) =>
        set((state) => ({
          inputMessages: new Map(state.inputMessages).set(
            chatroomId,
            text.length === 0 ? "" : text,
          ),
        })),
      addChatInputImage: (chatroomId: string, url: string) =>
        set((state) => {
          const urls = state.inputImages.get(chatroomId);
          if (urls) {
            return {
              ...state,
              inputImages: new Map(state.inputImages).set(chatroomId, [
                url,
                ...urls,
              ]),
            };
          } else {
            return state;
          }
        }),
      removeChatInputImage: (chatroomId: string, id: number) =>
        set((state) => {
          const urls = state.inputImages.get(chatroomId);
          const updatedImageUrls = urls?.filter((url, index) => {
            if (index === id) {
              URL.revokeObjectURL(url);
              return false;
            }
            return true;
          });
          if (updatedImageUrls) {
            return {
              ...state,
              inputImages: new Map(state.inputImages).set(
                chatroomId,
                updatedImageUrls,
              ),
            };
          }
          return state;
        }),
    },
  }),
);

export default useChatMapStore;
