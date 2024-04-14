import { create } from "zustand";
import { TChatroom } from "../../../../server/src/types/types";

export type ActiveList = "inbox" | "user" | "";

type ChatStore = {
  isMessagesLoading: boolean;
  showEmojiPicker: boolean;
  selectedImageFiles: File[];
  shouldFetchMoreMessages: boolean;
  typingUser: string;
  isTyping: boolean;
  showDetails: boolean;
  currentChatroom: TChatroom | null;
  actions: {
    setShowEmojiPicker: (bool: boolean) => void;
    setIsMessagesLoading: (isLoaded: boolean) => void;
    addSelectedFile: (file: File) => void;
    clearSelectedFiles: () => void;
    removeSelectedFile: (id: number) => void;
    setShouldFetchMoreMessages: (val: boolean) => void;
    setTypingUser: (userId: string) => void;
    setIsTyping: (isTyping: boolean) => void;
    setShowDetails: (isOpen: boolean) => void;
    setCurrentChatroom: (data: TChatroom | null) => void;
  };
};

const useChatStore = create<ChatStore>(
  (set): ChatStore => ({
    currentChatroom: null,
    showDetails: false,
    typingUser: "",
    isTyping: false,
    shouldFetchMoreMessages: true,
    isMessagesLoading: true,
    selectedImageFiles: [],
    showEmojiPicker: false,
    actions: {
      clearSelectedFiles: () => set({ selectedImageFiles: [] }),
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
      setIsTyping: (isTyping) => set({ isTyping }),
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
