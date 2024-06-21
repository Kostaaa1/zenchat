import { create } from "zustand"
import { TChatroom, TUserData } from "../../../server/src/types/types"

type TUserStore = {
  user: TUserData | null
  userChats: TChatroom[] | null
  areChatsLoading: boolean
  sessionToken: string | null
  unreadChatIds: string[]
  actions: {
    removeUnreadChatId: (id: string) => void
    setUnreadChatIds: (unreadChats: string[]) => void
    setSessionToken: (token: string) => void
    setAreChatsLoading: (v: boolean) => void
    setUser: (user: TUserData) => void
    setUserChats: (chats: TChatroom[]) => void
  }
}

const useUserStore = create<TUserStore>(
  (set): TUserStore => ({
    user: null,
    userChats: null,
    areChatsLoading: true,
    sessionToken: null,
    unreadChatIds: [],
    actions: {
      removeUnreadChatId: (id: string) =>
        set((state) => ({ unreadChatIds: state.unreadChatIds.filter((x) => x !== id) })),
      setUnreadChatIds: (unreadChatIds: string[]) => set({ unreadChatIds }),
      setAreChatsLoading: (areChatsLoading: boolean) => set({ areChatsLoading }),
      setUser: (user: TUserData) => set({ user }),
      setUserChats: (chats: TChatroom[]) => set({ userChats: chats }),
      setSessionToken: (sessionToken: string) => set({ sessionToken })
    }
  })
)

export default useUserStore
