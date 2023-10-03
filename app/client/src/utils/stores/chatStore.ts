import { Skin } from "@emoji-mart/data";
import { create } from "zustand";
import { TChatRoomData, TMessage } from "../../../../server/src/types/types";
import { trpc, trpcVanilla } from "../trpcClient";

export type ActiveList = "inbox" | "user" | "";

const handleSelectEmoji = (e: Skin, message: string): string =>
  `${message}${e.native}`;

type ChatMessage = {
  chatroom_id: string;
  messages: TMessage[];
};

type ChatStore = {
  newMessage: string;
  setNewMessage: (msg: string) => void;
  isMessagesLoading: boolean;
  setIsMessagesLoading: (isLoaded: boolean) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (bool: boolean) => void;
  handleSelectEmoji: (e: Skin, msg: string) => void;
  selectedImageFiles: File[];
  addSelectedFile: (file: File) => void;
  clearSelectedFiles: () => void;
  removeSelectedFile: (id: number) => void;
  currentChatroom: TChatRoomData | undefined;
  setCurrentChatroom: (currentChatroom: TChatRoomData) => void;
  shouldFetchMoreMessages: boolean;
  setShouldFetchMoreMessages: (val: boolean) => void;
};

const useChatStore = create<ChatStore>(
  (set): ChatStore => ({
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
    currentChatroom: undefined,
    setCurrentChatroom: (currentChatroom: TChatRoomData) =>
      set((state) => ({
        ...state,
        currentChatroom,
      })),
    newMessage: "",
    setNewMessage: (message: string) =>
      set((state) => ({
        ...state,
        newMessage: message,
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
    handleSelectEmoji: (e) =>
      set((state) => ({
        ...state,
        message: handleSelectEmoji(e, state.newMessage),
      })),
  }),
);

export default useChatStore;
