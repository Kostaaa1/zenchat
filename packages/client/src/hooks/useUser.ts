import { trpc } from "../lib/trpcClient"
import useUserStore from "../stores/userStore"

const useUser = () => {
  const utils = trpc.useUtils()
  const { areChatsLoading, sessionToken, unreadChatIds, user, userChats } = useUserStore((state) => ({
    sessionToken: state.sessionToken,
    areChatsLoading: state.areChatsLoading,
    unreadChatIds: state.unreadChatIds,
    user: state.user,
    userChats: state.userChats
  }))

  const updateUser = ({ username, newFields }: { username: string; newFields: Partial<typeof user> }) => {
    utils.user.get.setData({ data: username, type: "username" }, (state) => {
      return state ? { ...state, ...newFields } : state
    })
  }

  return {
    areChatsLoading,
    sessionToken,
    unreadChatIds,
    user,
    userChats,
    updateUser
  }
}

export default useUser
