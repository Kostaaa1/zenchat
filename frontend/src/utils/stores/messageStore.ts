import { Skin } from "@emoji-mart/data";
import React from "react";
import { create } from "zustand";

export type ActiveList = "inbox" | "user" | "";

export interface IUserData {
  id: string;
  created_at: string;
  username: string;
  email: string;
  image_url: string;
  first_name: string;
  last_name: string;
}

export interface TChat {
  id?: string;
  created_at?: string;
  last_message: string;
  userId1: number;
  userId2: number;
}

const handleSelectEmoji = (e: Skin, message: string): string =>
  `${message}${e.native}`;

type MessageStore = {
  message: string;
  setMessage: (msg: string) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (bool: boolean) => void;
  handleSelectEmoji: (e: Skin, msg: string) => void;
};

const useMessageStore = create<MessageStore>(
  (set): MessageStore => ({
    message: "",
    setMessage: (message: string) =>
      set((state) => ({
        ...state,
        message,
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

export default useMessageStore;
