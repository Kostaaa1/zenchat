import { create } from "zustand";
import { TChatroom } from "../../../../server/src/types/types";

export type ActiveList = "inbox" | "user" | "";

type ChatStore = {
  isMessagesLoading: boolean;
  setIsMessagesLoading: (isLoaded: boolean) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (bool: boolean) => void;
  selectedImageFiles: File[];
  addSelectedFile: (file: File) => void;
  clearSelectedFiles: () => void;
  removeSelectedFile: (id: number) => void;
  shouldFetchMoreMessages: boolean;
  setShouldFetchMoreMessages: (val: boolean) => void;
  typingUser: string;
  setTypingUser: (userId: string) => void;
  isTyping: boolean;
  setIsTyping: (isTyping: boolean) => void;
  showDetails: boolean;
  setShowDetails: (isOpen: boolean) => void;
  currentChatroom: TChatroom | null;
  setCurrentChatroom: (data: TChatroom | null) => void;
};

const useChatStore = create<ChatStore>(
  (set): ChatStore => ({
    currentChatroom: null,
    setCurrentChatroom: (data: TChatroom | null) =>
      set((state) => ({
        ...state,
        currentChatroom: data,
      })),
    showDetails: false,
    setShowDetails: (isOpen: boolean) =>
      set((state) => ({
        ...state,
        showDetails: isOpen,
      })),
    typingUser: "",
    setTypingUser: (userId: string) =>
      set((state) => ({
        ...state,
        typingUser: userId,
      })),
    isTyping: false,
    setIsTyping: (isTyping) =>
      set((state) => ({
        ...state,
        isTyping,
      })),
    shouldFetchMoreMessages: true,
    setShouldFetchMoreMessages: (val: boolean) =>
      set((state) => ({
        ...state,
        shouldFetchMoreMessages: val,
      })),
    isMessagesLoading: true,
    setIsMessagesLoading: (isLoaded: boolean) =>
      set((state) => ({
        ...state,
        isMessagesLoading: isLoaded,
      })),
    selectedImageFiles: [],
    addSelectedFile: (newFile: File) =>
      set((state) => ({
        ...state,
        selectedImageFiles: [...state.selectedImageFiles, newFile],
      })),
    clearSelectedFiles: () =>
      set((state) => ({
        ...state,
        selectedImageFiles: [],
      })),
    removeSelectedFile: (id: number) =>
      set((state) => ({
        ...state,
        selectedImageFiles: state.selectedImageFiles.filter(
          (_, index) => id !== index,
        ),
      })),
    showEmojiPicker: false,
    setShowEmojiPicker: (bool: boolean) =>
      set((state) => ({ ...state, showEmojiPicker: bool })),
  }),
);

export default useChatStore;
