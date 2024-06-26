import { useCallback, useEffect, useRef, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import useGeneralStore from "../stores/generalStore"
import useModalStore from "../stores/modalStore"
import useChatStore from "../stores/chatStore"
import { trpc } from "../lib/trpcClient"
import useChatCache from "./useChatCache"
import { TMessage } from "../../../server/src/types/types"
import useUser from "./useUser"
import { loadImage } from "../utils/image"
import { debounce } from "lodash"
import { socket } from "../lib/socket"

const MESSAGE_FETCH_LIMIT = 22

const useChat = () => {
  const utils = trpc.useUtils()
  const scrollRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, removeUnreadChatId } = useUser()
  const { chatroomId } = useParams<{ chatroomId: string }>()
  const isMobile = useGeneralStore((state) => state.isMobile)
  const { setActiveMessage } = useModalStore((state) => state.actions)
  const { activeMessage } = useModalStore((state) => ({
    activeMessage: state.activeMessage
  }))
  const [lastMessageDate, setLastMessageDate] = useState<string | null>(null)
  const { markUserMsgSeen } = useChatCache()
  const { setActiveChatroom } = useChatStore((state) => state.actions)
  const [isMessagesLoading, setIsMessagesLoading] = useState<boolean>(true)
  const { setShouldFetchMoreMessages, setShowDetails } = useChatStore((state) => state.actions)
  const { activeChatroomTitle, activeChatroom, shouldFetchMoreMessages } = useChatStore((state) => ({
    activeChatroomTitle: state.activeChatroomTitle,
    shouldFetchMoreMessages: state.shouldFetchMoreMessages,
    activeChatroom: state.activeChatroom
  }))
  const { data: messages } = trpc.chat.messages.get.useQuery(
    { chatroom_id: chatroomId! },
    { enabled: !!activeChatroom && !!chatroomId }
  )

  const triggerReadMessagesMutation = trpc.chat.messages.triggerReadMessages.useMutation({
    onSuccess: () => {
      if (activeChatroom && user) {
        const receivers = activeChatroom.users.filter((x) => x.user_id !== user.id).map((x) => x.user_id)
        socket.emit("msgSeen", {
          chatroomId,
          participants: receivers
        })
      }
    },
    onError: (err) => {
      console.log("error", err)
    }
  })

  const handleReadMessages = (user_id: string, id: string) => {
    if (!chatroomId) return
    console.log("ran ", chatroomId)
    removeUnreadChatId(user_id)
    markUserMsgSeen(chatroomId, user_id, true)
    triggerReadMessagesMutation.mutate(id)
  }

  useEffect(() => {
    if (activeChatroom && user) {
      const foundUser = activeChatroom.users.find((x) => x.user_id === user.id)
      if (foundUser) {
        const eventHandler = () => {
          console.log("Event handle ran")
          handleReadMessages(foundUser.user_id, foundUser.id)
          document.removeEventListener("click", eventHandler)
        }

        if (!foundUser.is_message_seen) {
          document.addEventListener("click", eventHandler)
        }
        return () => {
          document.removeEventListener("click", eventHandler)
        }
      }
    }
  }, [activeChatroom, user])

  useEffect(() => {
    if (activeChatroom && user) {
      const foundUser = activeChatroom.users.find((x) => x.user_id === user.id)
      if (foundUser && !foundUser.is_message_seen) {
        handleReadMessages(foundUser.user_id, foundUser.id)
      }
    }
  }, [location.pathname && location.pathname.includes("/inbox")])

  const loadMessages = useCallback(
    async (messages: TMessage[]) => {
      await Promise.all(
        messages.map(async (msg) => {
          if (msg.is_image) await loadImage(msg.content)
        })
      )
      setIsMessagesLoading(false)
    },
    [setIsMessagesLoading]
  )
  const scrollToStart = () => scrollRef.current?.scrollTo({ top: 0 })

  const { mutateAsync: getMoreMutation } = trpc.chat.messages.getMore.useMutation({
    mutationKey: [{ chatroom_id: activeChatroom?.chatroom_id }],
    onSuccess: (messages) => {
      if (!messages || !shouldFetchMoreMessages || !activeChatroom) return
      utils.chat.messages.get.setData({ chatroom_id: activeChatroom.chatroom_id }, (staleChats) => {
        if (staleChats && messages) return [...staleChats, ...messages]
      })
      if (messages.length < MESSAGE_FETCH_LIMIT) {
        setShouldFetchMoreMessages(false)
      }
    },
    onError: (err) => {
      console.error("Error fetching more messages:", err)
    }
  })

  useEffect(() => {
    if (messages) {
      messages.length === 0 ? setIsMessagesLoading(false) : loadMessages(messages)
    }
  }, [messages, loadMessages])

  useEffect(() => {
    if (!messages) return
    if (messages.length === 0 || messages.length < MESSAGE_FETCH_LIMIT) {
      setShouldFetchMoreMessages(false)
      return
    }
    if (messages.length > 0) {
      setLastMessageDate(messages[messages.length - 1].created_at)
    }
  }, [messages, setLastMessageDate, setShouldFetchMoreMessages])

  useEffect(() => {
    const container = scrollRef.current
    if (!container || !activeChatroom || isMessagesLoading) return
    const cleanup = () => {
      container.removeEventListener("scroll", fetchMoreMessagesObserver)
      fetchMoreMessagesObserver.cancel()
    }
    const fetchMoreMessagesObserver = debounce(() => {
      if (shouldFetchMoreMessages && lastMessageDate) {
        const { scrollTop, clientHeight, scrollHeight } = container
        const scrollTolerance = 40
        const diff = scrollHeight - clientHeight - scrollTolerance
        if (Math.abs(scrollTop) >= diff) {
          getMoreMutation({
            chatroom_id: activeChatroom?.chatroom_id,
            lastMessageDate
          })
        } else {
          if (!shouldFetchMoreMessages) {
            cleanup()
          }
        }
      }
    }, 300)
    container.addEventListener("scroll", fetchMoreMessagesObserver)
    return () => {
      cleanup()
    }
  }, [activeChatroom, shouldFetchMoreMessages, lastMessageDate, isMessagesLoading])

  useEffect(() => {
    return () => {
      setActiveChatroom(null)
      setShowDetails(false)
    }
  }, [setActiveChatroom, setShowDetails])

  return {
    scrollRef,
    isMessagesLoading,
    messages,
    loadMessages,
    setActiveMessage,
    navigate,
    activeMessage,
    scrollToStart,
    activeChatroomTitle,
    chatroomId,
    shouldFetchMoreMessages,
    isMobile
  }
}

export default useChat
