import { create } from "zustand";
import { TChatroom, TMessage } from "../../../../server/src/types/types";

type ChatStore = {
  showEmojiPicker: boolean;
  shouldFetchMoreMessages: boolean;
  showDetails: boolean;
  activeChatroom: TChatroom | null;
  activeChatroomTitle: string | null;
  unreadMessagesCount: number;
  messages: TMessage[];
  isChatLoading: boolean;
  actions: {
    setIsChatLoading: (v: boolean) => void;
    decrementUnreadMessagesCount: () => void;
    incrementUnreadMessagesCount: () => void;
    setUnreadMessagesCount: (v: number) => void;
    setMessages: (messages: TMessage[]) => void;
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
    messages: [],
    isChatLoading: true,
    actions: {
      setMessages: (messages: TMessage[]) => set({ messages }),
      setIsChatLoading: (l: boolean) => set({ isChatLoading: l }),
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
          console.log("Increment called", state.unreadMessagesCount);
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
      setShouldFetchMoreMessages: (val: boolean) =>
        set({ shouldFetchMoreMessages: val }),
    },
  }),
);

export default useChatStore;
