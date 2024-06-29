import { TChatroom, TMessage } from "../../../server/src/types/types"
import { useCallback } from "react"
import { trpc } from "../lib/trpcClient"
import useChatStore from "../stores/chatStore"
import useUser from "./useUser"
import { useNavigate } from "react-router-dom"
import { getCurrentDate } from "../utils/date"

const useChatCache = () => {
  const utils = trpc.useUtils()
  const activeChatroom = useChatStore((state) => state.activeChatroom)
  const { setActiveChatroom } = useChatStore((state) => state.actions)
  const { user } = useUser()
  const navigate = useNavigate()
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

  const markUserMsgSeen = useCallback(
    (chatroomId: string, user_id: string, is_message_seen: boolean) => {
      return utils.chat.get.user_chatrooms.setData(user_id, (state) => {
        if (state && user) {
          return state.map((chatrooms) =>
            chatrooms.chatroom_id === chatroomId
              ? {
                  ...chatrooms,
                  users: chatrooms.users.map((x) => (x.user_id === user_id ? { ...x, is_message_seen } : x))
                }
              : chatrooms
          )
        }
      })
    },
    [user]
  )

  const markParticipantsMsgSeen = useCallback(
    (chatroomId: string, isSeen: boolean) => {
      if (!user) return
      utils.chat.get.user_chatrooms.setData(user.id, (chatrooms) => {
        return chatrooms
          ? chatrooms.map((x) =>
              x.chatroom_id === chatroomId
                ? { ...x, users: x.users.map((u) => (u.id !== user.id ? { ...u, is_message_seen: isSeen } : u)) }
                : x
            )
          : chatrooms
      })
    },
    [user]
  )

  const addNewMessageToChatCache = useCallback(
    (message: TMessage) => {
      if (!activeChatroom) return
      // setActiveChatroom({
      //   ...activeChatroom,
      //   users: activeChatroom.users.map((x) => (x.id !== message.sender_id ? { ...x, is_message_seen: false } : x))
      // })
      markParticipantsMsgSeen(message.chatroom_id, false)
      utils.chat.messages.get.setData(
        {
          chatroom_id: message.chatroom_id
        },
        (state) => {
          if (state && message) return [message, ...state]
        }
      )
    },
    [activeChatroom]
  )

  const updateLastMessage = useCallback(
    (msg: TMessage) => {
      const { content, chatroom_id, sender_id } = msg

      const updateChatroom = (chatroom: TChatroom): TChatroom => {
        if (chatroom.chatroom_id !== chatroom_id) return chatroom
        const updatedUsers = chatroom.users.map((user) => ({
          ...user,
          is_message_seen: user.user_id === sender_id,
          is_socket_active: true
        }))
        return { ...chatroom, last_message: content, created_at: getCurrentDate(), users: updatedUsers }
      }

      const sortByCreatedAt = (a: TChatroom, b: TChatroom) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()

      let newChatrooms: TChatroom[] = []
      utils.chat.get.user_chatrooms.setData(user!.id, (chats) => {
        if (!chats) return chats
        const updatedChats = chats.map(updateChatroom).sort(sortByCreatedAt)
        newChatrooms = updatedChats
        return updatedChats
      })

      return newChatrooms
    },
    [utils.chat.get.user_chatrooms, user, activeChatroom]
  )

  return {
    removeChatFromUserChats,
    removeMessageCache,
    markParticipantsMsgSeen,
    addNewMessageToChatCache,
    markUserMsgSeen,
    updateLastMessage
  }
}

export default useChatCache
