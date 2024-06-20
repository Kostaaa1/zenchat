import { create } from "zustand"
import { TChatroom } from "../../../server/src/types/types"

type ChatStore = {
  showEmojiPicker: boolean
  shouldFetchMoreMessages: boolean
  showDetails: boolean
  activeChatroom: TChatroom | null
  activeChatroomTitle: string | null
  // unreadMessagesCount: number
  // isUserChatsLoading: boolean
  unreadChats: string[]
  actions: {
    // setIsUserChatsLoading: (v: boolean) => void
    setUnreadChats: (c: string[]) => void
    // decrementUnreadMessagesCount: () => void
    // incrementUnreadMessagesCount: () => void
    // setUnreadMessagesCount: (v: number) => void
    setShowEmojiPicker: (bool: boolean) => void
    setShouldFetchMoreMessages: (val: boolean) => void
    setShowDetails: (isOpen: boolean) => void
    setActiveChatroom: (data: TChatroom | null) => void
    setActiveChatroomTitle: (v: string) => void
  }
}

const useChatStore = create<ChatStore>(
  (set): ChatStore => ({
    showDetails: false,
    showEmojiPicker: false,
    shouldFetchMoreMessages: true,
    activeChatroom: null,
    activeChatroomTitle: null,
    unreadChats: [],
    // isUserChatsLoading: true,
    // unreadMessagesCount: 0,
    actions: {
      // setIsUserChatsLoading: (isUserChatsLoading: boolean) => set({ isUserChatsLoading }),
      setUnreadChats: (unreadChats: string[]) => set({ unreadChats }),
      // setUnreadChats: (id: string) =>
      //   set((state) => {
      //     const { unreadChats } = state
      //     if (!unreadChats.includes(id)) {
      //       console.log("Increamenting..", id)
      //       return { ...state, unreadMessagesCount: state.unreadMessagesCount + 1, unreadChats: [id, ...unreadChats] }
      //     } else {
      //       return state
      //     }
      //   }),
      // decrementUnreadMessagesCount: () =>
      //   set((state) => {
      //     const count = state.unreadMessagesCount
      //     return count > 0 ? { ...state, unreadMessagesCount: count - 1 } : state
      //   }),
      // incrementUnreadMessagesCount: () =>
      //   set((state) => {
      //     return {
      //       ...state,
      //       unreadMessagesCount: state.unreadMessagesCount + 1
      //     }
      //   }),
      // setUnreadMessagesCount: (unreadMessagesCount: number) => set({ unreadMessagesCount }),
      setShouldFetchMoreMessages: (val: boolean) => set({ shouldFetchMoreMessages: val }),
      setActiveChatroomTitle: (activeChatroomTitle) => set({ activeChatroomTitle }),
      setActiveChatroom: (activeChatroom: TChatroom | null) => set({ activeChatroom }),
      setShowEmojiPicker: (bool: boolean) => set((state) => ({ ...state, showEmojiPicker: bool })),
      setShowDetails: (isOpen: boolean) => set({ showDetails: isOpen })
    }
  })
)

export default useChatStore
