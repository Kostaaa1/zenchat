import { create } from "zustand";
import { TChatroom } from "../../../../server/src/types/types";

type ChatStore = {
  showEmojiPicker: boolean;
  shouldFetchMoreMessages: boolean;
  showDetails: boolean;
  activeChatroom: TChatroom | null;
  activeChatroomTitle: string | null;
  unreadMessagesCount: number;
  isMessagesLoading: boolean;
  lastMessageDate: string;
  actions: {
    setIsMessagesLoading: (v: boolean) => void;
    setLastMessageDate: (s: string) => void;
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
    showEmojiPicker: false,
    activeChatroom: null,
    activeChatroomTitle: null,
    shouldFetchMoreMessages: true,
    unreadMessagesCount: 0,
    lastMessageDate: "",
    isMessagesLoading: true,
    actions: {
      setLastMessageDate: (lastMessageDate: string) => set({ lastMessageDate }),
      setIsMessagesLoading: (val: boolean) => set({ isMessagesLoading: val }),
      setShouldFetchMoreMessages: (val: boolean) =>
        set({ shouldFetchMoreMessages: val }),
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
          return {
            ...state,
            unreadMessagesCount: state.unreadMessagesCount + 1,
          };
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
    },
  }),
);

export default useChatStore;
