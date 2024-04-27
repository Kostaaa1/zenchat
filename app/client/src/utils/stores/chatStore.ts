import { create } from "zustand";
import { TChatroom } from "../../../../server/src/types/types";

export type ActiveList = "inbox" | "user" | "";

type ChatStore = {
  isMessagesLoading: boolean;
  showEmojiPicker: boolean;
  selectedImageFiles: File[];
  shouldFetchMoreMessages: boolean;
  typingUser: string;
  showDetails: boolean;
  currentChatroom: TChatroom | null;
  currentChatroomTitle: string | null;
  actions: {
    setShowEmojiPicker: (bool: boolean) => void;
    setIsMessagesLoading: (isLoaded: boolean) => void;
    addSelectedFile: (file: File) => void;
    clearSelectedFiles: () => void;
    removeSelectedFile: (id: number) => void;
    setShouldFetchMoreMessages: (val: boolean) => void;
    setShowDetails: (isOpen: boolean) => void;
    setTypingUser: (userId: string) => void;
    setCurrentChatroom: (data: TChatroom | null) => void;
    setCurrentChatroomTitle: (v: string) => void;
  };
};

const useChatStore = create<ChatStore>(
  (set): ChatStore => ({
    showDetails: false,
    typingUser: "",
    shouldFetchMoreMessages: true,
    isMessagesLoading: true,
    selectedImageFiles: [],
    showEmojiPicker: false,
    currentChatroom: null,
    currentChatroomTitle: null,
    actions: {
      clearSelectedFiles: () => set({ selectedImageFiles: [] }),
      setCurrentChatroomTitle: (currentChatroomTitle) =>
        set({ currentChatroomTitle }),
      setCurrentChatroom: (currentChatroom: TChatroom | null) =>
        set({ currentChatroom }),
      setShowEmojiPicker: (bool: boolean) =>
        set((state) => ({ ...state, showEmojiPicker: bool })),
      removeSelectedFile: (id: number) =>
        set((state) => ({
          selectedImageFiles: state.selectedImageFiles.filter(
            (_, index) => id !== index,
          ),
        })),
      setShowDetails: (isOpen: boolean) => set({ showDetails: isOpen }),
      setTypingUser: (userId: string) => set({ typingUser: userId }),
      addSelectedFile: (newFile: File) =>
        set((state) => ({
          selectedImageFiles: [...state.selectedImageFiles, newFile],
        })),
      setIsMessagesLoading: (isLoaded: boolean) =>
        set({ isMessagesLoading: isLoaded }),
      setShouldFetchMoreMessages: (val: boolean) =>
        set({ shouldFetchMoreMessages: val }),
    },
  }),
);

export default useChatStore;
