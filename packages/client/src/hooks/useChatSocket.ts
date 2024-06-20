import { useCallback, useEffect } from "react"
import useUser from "./useUser"
import useChatStore from "../stores/chatStore"
import { TChatroom, TMessage } from "../../../server/src/types/types"
import { trpc } from "../lib/trpcClient"
import { getCurrentDate } from "../utils/date"
import { SocketCallPayload, TReceiveNewSocketMessageType } from "../../../server/src/types/sockets"
import { loadImage } from "../utils/image"
import { toast } from "react-toastify"
import useModalStore from "../stores/modalStore"
import type { Socket } from "socket.io-client"
import usePeerConnectionStore from "../stores/peerConnection"
import { stopSound } from "../utils/file"

const useChatSocket = (socket: Socket | null) => {
  const { user } = useUser()
  const utils = trpc.useUtils()
  const { setIsCallAccepted } = usePeerConnectionStore((state) => state.actions)
  const { openModal, setCallerInfo } = useModalStore((state) => state.actions)
  const { setUnreadChats } = useChatStore((state) => state.actions)
  const { unreadChats, activeChatroom } = useChatStore((state) => ({
    activeChatroom: state.activeChatroom,
    unreadChats: state.unreadChats
  }))
  // const [unreadChats, setUnreadChats] = useState<string[]>([])

  const addNewMessageToChatCache = useCallback(
    (messageData: TMessage) => {
      utils.chat.messages.get.setData(
        {
          chatroom_id: messageData.chatroom_id
        },
        (staleChats) => {
          if (staleChats && messageData) {
            return [messageData, ...staleChats]
          }
        }
      )
    },
    [utils.chat.messages.get]
  )
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
      const { content, chatroom_id } = msg
      let updated: TChatroom[] = []
      utils.chat.get.user_chatrooms.setData(user?.id, (state) => {
        const data = state
          ?.map((chat) =>
            chat.chatroom_id === chatroom_id
              ? {
                  ...chat,
                  last_message: content,
                  created_at: getCurrentDate(),
                  users:
                    activeChatroom?.chatroom_id === chat.chatroom_id
                      ? chat.users
                      : chat.users.map((participant) => {
                          return participant.user_id === user?.id
                            ? { ...participant, is_message_seen: false }
                            : participant
                        })
                }
              : chat
          )
          .sort((a, b) => {
            const dateA = new Date(a.created_at).getTime()
            const dateB = new Date(b.created_at).getTime()
            return dateB - dateA
          })

        if (data) {
          updated = data
          return data
        } else {
          return state
        }
      })

      return updated
    },
    [utils.chat.get.user_chatrooms, user, activeChatroom]
  )

  const receiveNewSocketMessage = useCallback(
    async (socketData: TReceiveNewSocketMessageType) => {
      if (!user) return
      console.log("UNREADCHATS: ", unreadChats)
      const { channel, data } = socketData
      if (channel === "onMessage") {
        const { message, shouldActivate } = data
        const { is_image, sender_id } = message
        if (is_image) await loadImage(message.content)
        const { user_chatrooms } = utils.chat.get
        if (shouldActivate) {
          console.log("The chat is inactive, need to refetch")
          ////////////////////////////////////////////////////
          await user_chatrooms.invalidate(user.id)
          await user_chatrooms.refetch(user.id)
          ////////////////////////////////////////////////////
        }

        // const chats = updateUserChatLastMessageCache(message)
        const isLoggedUserSender = sender_id === user?.id
        if (!isLoggedUserSender) {
          // const chat = chats[0]
          // const user = chat?.users.find((user) => user.username === userData.username)
          // setUnreadChats(chat.chatroom_id)
          // setUnreadChats((state) => {
          //   console.log("STATE: ", state)
          //   if (!state.includes(chat.chatroom_id)) {
          //     incrementUnreadMessagesCount()
          //     return [chat.chatroom_id, ...state]
          //   } else {
          //     return state
          //   }
          // })
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
    [
      activeChatroom,
      addNewMessageToChatCache,
      replacePreviewImage,
      updateUserChatLastMessageCache,
      user,
      unreadChats,
      setUnreadChats,
      utils.chat.get
    ]
  )

  const receiveCallPayload = useCallback(
    (payload: SocketCallPayload) => {
      const { type } = payload
      stopSound("source1")
      if (type === "initiated") {
        setCallerInfo(payload)
        openModal("voiceCall")
      }
      if (type === "accepted") {
        setIsCallAccepted(true)
      }
      if (type === "hangup") {
        const btn = document.getElementById("hangup")
        if (btn) btn.click()
      }
      // if (status === "declined") {
      //   setIsExchangeAllowed(true);
      // }
    },
    [openModal]
  )

  useEffect(() => {
    if (!user || !socket) return
    if (socket) {
      socket.emit("join-room", user.id)
      socket.emit("onMessage", user.id)
      socket.on("onMessage", receiveNewSocketMessage)
      socket.on("call", receiveCallPayload)
    }
    return () => {
      socket.disconnect()
    }
  }, [user, socket])
}

export default useChatSocket
