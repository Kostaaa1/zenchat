import { create } from "zustand";
import { TChatroom } from "../../../../server/src/types/types";

type ChatStore = {
  showEmojiPicker: boolean;
  shouldFetchMoreMessages: boolean;
  showDetails: boolean;
  activeChatroom: TChatroom | null;
  activeChatroomTitle: string | null;
  unreadMessagesCount: number;
  actions: {
    decrementUnreadMessagesCount: () => void;
    incrementUnreadMessagesCount: () => void;
    setUnreadMessagesCount: (v: number) => void;
    setShowEmojiPicker: (bool: boolean) => void;
    setShouldFetchMoreMessages: (val: boolean) => void;
    setShowDetails: (isOpen: boolean) => void;
    setActiveChatroom: (data: TChatroom | null) => void;
    setActiveChatroomTitle: (v: string) => void;
  };
};

const useChatStore = create<ChatStore>(
  (set): ChatStore => ({
    showDetails: false,
    shouldFetchMoreMessages: true,
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
      incrementUnreadMessagesCount: () =>
        set((state) => {
          const count = state.unreadMessagesCount;
          return { ...state, unreadMessagesCount: count + 1 };
        }),
      setUnreadMessagesCount: (unreadMessagesCount: number) =>
        set({ unreadMessagesCount }),
      setActiveChatroomTitle: (activeChatroomTitle) =>
        set({ activeChatroomTitle }),
      setActiveChatroom: (activeChatroom: TChatroom | null) =>
        set({ activeChatroom }),
      setShowEmojiPicker: (bool: boolean) =>
        set((state) => ({ ...state, showEmojiPicker: bool })),
      setShowDetails: (isOpen: boolean) => set({ showDetails: isOpen }),
      setShouldFetchMoreMessages: (val: boolean) =>
        set({ shouldFetchMoreMessages: val }),
    },
  }),
);

export default useChatStore;
