import { create } from "zustand"
import { TChatroom } from "../../../server/src/types/types"

type ChatStore = {
  showEmojiPicker: boolean
  shouldFetchMoreMessages: boolean
  showDetails: boolean
  activeChatroom: TChatroom | null
  activeChatroomTitle: string | null
  actions: {
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
    actions: {
      setShouldFetchMoreMessages: (val: boolean) => set({ shouldFetchMoreMessages: val }),
      setActiveChatroomTitle: (activeChatroomTitle) => set({ activeChatroomTitle }),
      setActiveChatroom: (activeChatroom: TChatroom | null) => set({ activeChatroom }),
      setShowEmojiPicker: (bool: boolean) => set((state) => ({ ...state, showEmojiPicker: bool })),
      setShowDetails: (isOpen: boolean) => set({ showDetails: isOpen })
    }
  })
)

export default useChatStore
