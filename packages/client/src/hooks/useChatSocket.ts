import { useCallback, useEffect } from "react"
import useUser from "./useUser"
import useChatStore from "../stores/chatStore"
import { SocketCallPayload, TChatroom, TMessage, TReceiveNewSocketMessageType } from "../../../server/src/types/types"
import { trpc } from "../lib/trpcClient"
import { getCurrentDate } from "../utils/date"
import { loadImage } from "../utils/image"
import { toast } from "react-toastify"
import useModalStore from "../stores/modalStore"
import type { Socket } from "socket.io-client"
import usePeerConnectionStore from "../stores/peerConnection"
import { stopSound } from "../utils/file"
import useChatCache from "./useChatCache"

const useChatSocket = (socket: Socket | null) => {
  const { user } = useUser()
  const utils = trpc.useUtils()
  const { setIsCallAccepted, setCallInfo, toggleDisplayVideo, toggleMuteVideo } = usePeerConnectionStore(
    (state) => state.actions
  )
  const { openModal } = useModalStore((state) => state.actions)
  const { activeChatroom } = useChatStore((state) => ({
    activeChatroom: state.activeChatroom
  }))
  const { addNewMessageToChatCache } = useChatCache()

  const replacePreviewImage = useCallback(
    (messageData: TMessage) => {
      utils.chat.messages.get.setData(
        {
          chatroom_id: messageData.chatroom_id
        },
        (staleChats) => {
          if (staleChats) {
            return staleChats.map((chat) => {
              if (chat.is_image && chat.id === messageData.id) {
                URL.revokeObjectURL(chat.content)
                return messageData
              } else {
                return chat
              }
            })
          }
        }
      )
    },
    [utils.chat.messages.get]
  )
  const updateUserChatLastMessageCache = useCallback(
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

  const receiveNewSocketMessage = useCallback(
    async (socketData: TReceiveNewSocketMessageType) => {
      if (!user || !activeChatroom) return
      const { channel, data } = socketData
      if (channel === "onMessage") {
        const { message, shouldActivate } = data
        const { is_image, sender_id } = message
        const { user_chatrooms } = utils.chat.get

        if (is_image) await loadImage(message.content)
        if (shouldActivate) {
          console.log("The chat is shadow banned...")
          await user_chatrooms.invalidate(user.id)
          await user_chatrooms.refetch(user.id)
        }

        updateUserChatLastMessageCache(message)
        const isLoggedUserSender = sender_id === user?.id
        if (!isLoggedUserSender) {
          if (!activeChatroom && !location.pathname.includes("/inbox")) {
            toast(`${message.sender_username}: ${message.content}`)
          }
        }

        if (!is_image) {
          if (!isLoggedUserSender) addNewMessageToChatCache(message)
        } else {
          isLoggedUserSender ? replacePreviewImage(message) : addNewMessageToChatCache(message)
        }
      }
    },
    [activeChatroom, user]
  )

  useEffect(() => {
    if (!activeChatroom || !socket || !user) return
    socket.on("onMessage", receiveNewSocketMessage)
    return () => {
      socket.off("onMessage")
    }
  }, [user, socket, receiveNewSocketMessage])

  const receiveCall = useCallback(
    (payload: SocketCallPayload) => {
      const { type, participants } = payload
      stopSound("source1")
      switch (type) {
        case "initiated": {
          setCallInfo(payload)
          openModal("voiceCall")
          break
        }
        case "accepted": {
          setCallInfo(payload)
          setIsCallAccepted(true)
          break
        }
        case "hangup": {
          const btn = document.getElementById("hangup")
          if (btn) btn.click()
          break
        }
        case "mute-remote": {
          const id = participants.find((x) => x.is_caller)!.id
          toggleMuteVideo(id)
          break
        }
        case "show-remote": {
          const id = participants.find((x) => x.is_caller)!.id
          toggleDisplayVideo(id)
          break
        }
        case "declined": {
          break
        }
      }
    },
    [openModal]
  )

  useEffect(() => {
    if (!user || !socket) return
    if (socket) {
      console.log("Listening to sockets.")
      socket.emit("join-room", user.id)
      socket.emit("onMessage", user.id)
      socket.on("call", receiveCall)
    }

    return () => {
      console.log("return called")
      socket.disconnect()
    }
  }, [socket, user])
}

export default useChatSocket
