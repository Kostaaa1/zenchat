import { TMessage } from "../../../server/src/types/types"
import { useCallback } from "react"
import { trpc } from "../lib/trpcClient"
import useChatStore from "../stores/chatStore"
import useUser from "./useUser"
import { useNavigate } from "react-router-dom"

const useChatCache = () => {
  const utils = trpc.useUtils()
  const { setActiveChatroom } = useChatStore((state) => state.actions)
  const { user } = useUser()
  const navigate = useNavigate()

  const addNewMessageToChatCache = useCallback(
    (messageData: TMessage) => {
      utils.chat.messages.get.setData(
        {
          chatroom_id: messageData.chatroom_id
        },
        (state) => {
          if (state && messageData) {
            return [messageData, ...state]
          }
        }
      )
    },
    [utils.chat.messages.get]
  )

  const removeMessageCache = (id: string, chatroom_id: string) => {
    utils.chat.messages.get.setData({ chatroom_id }, (state) => (state ? state.filter((x) => x.id !== id) : state))
  }

  const removeChatFromUserChats = (chatroom_id: string) => {
    utils.chat.get.user_chatrooms.setData(user!.id, (state) => {
      return state?.filter((x) => x.chatroom_id !== chatroom_id)
    })
    setActiveChatroom(null)
    navigate("/inbox")
  }

  const updateUserReadMessage = useCallback(
    (id: string, is_message_seen: boolean) => {
      return utils.chat.get.user_chatrooms.setData(user?.id, (state) => {
        if (state && user) {
          console.log("State: ", state, "To update: ", id)
          return state.map((chatrooms) =>
            chatrooms.chatroom_id === id
              ? {
                  ...chatrooms,
                  users: chatrooms.users.map((x) => (x.user_id === user.id ? { ...x, is_message_seen } : x))
                }
              : chatrooms
          )
        }
      })
    },
    [user, utils.chat.get.user_chatrooms]
  )

  return {
    removeChatFromUserChats,
    removeMessageCache,
    updateUserReadMessage,
    addNewMessageToChatCache
  }
}

export default useChatCache
