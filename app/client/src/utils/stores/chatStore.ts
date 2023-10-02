import { Skin } from "@emoji-mart/data";
import { create } from "zustand";
import { TChatRoomData, TMessage } from "../../../../server/src/types/types";
import { trpc, trpcVanilla } from "../trpcClient";

export type ActiveList = "inbox" | "user" | "";

const handleSelectEmoji = (e: Skin, message: string): string =>
  `${message}${e.native}`;

type ChatStore = {
  message: string;
  setMessage: (msg: string) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (bool: boolean) => void;
  handleSelectEmoji: (e: Skin, msg: string) => void;
  selectedImageFiles: File[];
  addSelectedFile: (file: File) => void;
  clearSelectedFiles: () => void;
  removeSelectedFile: (id: number) => void;
  currentChatroom: TChatRoomData | undefined;
  setCurrentChatroom: (currentChatroom: TChatRoomData) => void;
};

const useChatStore = create<ChatStore>(
  (set): ChatStore => ({
    currentChatroom: undefined,
    setCurrentChatroom: (currentChatroom: TChatRoomData) =>
      set((state) => ({
        ...state,
        currentChatroom,
      })),
    message: "",
    setMessage: (message: string) =>
      set((state) => ({
        ...state,
        message,
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
        message: handleSelectEmoji(e, state.message),
      })),
  }),
);

export default useChatStore;
