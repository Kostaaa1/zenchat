import { create } from "zustand";
import { TChatroom } from "../../../../server/src/types/types";

export type TActiveChatroom = TChatroom & {
  img_urls: string[];
  new_message: string;
};

type ChatStore = {
  showEmojiPicker: boolean;
  selectedImageFiles: File[];
  shouldFetchMoreMessages: boolean;
  showDetails: boolean;
  activeChatroom: TActiveChatroom | null;
  activeChatroomTitle: string | null;
  unreadMessagesCount: number;
  actions: {
    decrementUnreadMessagesCount: () => void;
    setUnreadMessagesCount: (v: number) => void;
    setShowEmojiPicker: (bool: boolean) => void;
    addSelectedFile: (file: File) => void;
    clearSelectedFiles: () => void;
    removeSelectedFile: (id: number) => void;
    setShouldFetchMoreMessages: (val: boolean) => void;
    setShowDetails: (isOpen: boolean) => void;
    setActiveChatroom: (data: TActiveChatroom | null) => void;
    setActiveChatroomTitle: (v: string) => void;
  };
};

const useChatStore = create<ChatStore>(
  (set): ChatStore => ({
    showDetails: false,
    shouldFetchMoreMessages: true,
    selectedImageFiles: [],
    showEmojiPicker: false,
    activeChatroom: null,
    activeChatroomTitle: null,
    unreadMessagesCount: 0,
    actions: {
      decrementUnreadMessagesCount: () =>
        set((state) => {
          const count = state.unreadMessagesCount;
          if (count > 0) {
            return { ...state, unreadMessagesCount: count - 1 };
          } else {
            return state;
          }
        }),
      setUnreadMessagesCount: (unreadMessagesCount: number) =>
        set({ unreadMessagesCount }),
      clearSelectedFiles: () => set({ selectedImageFiles: [] }),
      setActiveChatroomTitle: (activeChatroomTitle) =>
        set({ activeChatroomTitle }),
      setActiveChatroom: (activeChatroom: TActiveChatroom | null) =>
        set({ activeChatroom }),
      setShowEmojiPicker: (bool: boolean) =>
        set((state) => ({ ...state, showEmojiPicker: bool })),
      removeSelectedFile: (id: number) =>
        set((state) => ({
          selectedImageFiles: state.selectedImageFiles.filter(
            (_, index) => id !== index,
          ),
        })),
      setShowDetails: (isOpen: boolean) => set({ showDetails: isOpen }),
      addSelectedFile: (newFile: File) =>
        set((state) => ({
          selectedImageFiles: [...state.selectedImageFiles, newFile],
        })),
      setShouldFetchMoreMessages: (val: boolean) =>
        set({ shouldFetchMoreMessages: val }),
    },
  }),
);

export default useChatStore;
