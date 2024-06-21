import { useNavigate } from "react-router-dom"
import { useAuth } from "@clerk/clerk-react"
import { trpc } from "../lib/trpcClient"
import useUserStore from "../stores/userStore"

const useUser = () => {
  const { signOut } = useAuth()
  const utils = trpc.useUtils()
  const navigate = useNavigate()
  const ctx = trpc.useUtils()
  const actions = useUserStore((state) => state.actions)
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

  const logout = () => {
    navigate("/")
    ctx.invalidate()
    signOut()
  }

  return {
    ...actions,
    areChatsLoading,
    sessionToken,
    unreadChatIds,
    user,
    userChats,
    updateUser,
    logout
  }
}

export default useUser
