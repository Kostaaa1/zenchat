import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import useGeneralStore from "../stores/generalStore"
import useModalStore from "../stores/modalStore"
import useChatStore from "../stores/chatStore"
import { trpc } from "../lib/trpcClient"
import useChatCache from "./useChatCache"
import { TMessage } from "../../../server/src/types/types"
import useUser from "./useUser"
import { loadImage } from "../utils/image"
import { debounce } from "lodash"

const MESSAGE_FETCH_LIMIT = 22

const useChatMessages = () => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { user } = useUser()
  const { chatroomId } = useParams<{ chatroomId: string }>()
  const isMobile = useGeneralStore((state) => state.isMobile)
  const { setActiveMessage } = useModalStore((state) => state.actions)
  const { activeMessage } = useModalStore((state) => ({
    activeMessage: state.activeMessage
  }))
  const [lastMessageDate, setLastMessageDate] = useState<string | null>(null)
  const { activeChatroomTitle, activeChatroom, shouldFetchMoreMessages } = useChatStore((state) => ({
    activeChatroomTitle: state.activeChatroomTitle,
    shouldFetchMoreMessages: state.shouldFetchMoreMessages,
    activeChatroom: state.activeChatroom
  }))
  const utils = trpc.useUtils()
  const { updateUserReadMessage } = useChatCache()
  const { setActiveChatroom } = useChatStore((state) => state.actions)
  const [isMessagesLoading, setIsMessagesLoading] = useState<boolean>(true)
  const { data: messages } = trpc.chat.messages.get.useQuery(
    { chatroom_id: chatroomId! },
    { enabled: !!activeChatroom && !!chatroomId }
  )
  const { setShouldFetchMoreMessages, setShowDetails } = useChatStore((state) => state.actions)
  const triggerReadMessagesMutation = trpc.chat.messages.triggerReadMessages.useMutation({
    onSuccess: () => {
      if (activeChatroom) {
        // decrementUnreadMessagesCount()
        // remove from the unreadChats ?
        updateUserReadMessage(activeChatroom.chatroom_id, true)
      }
    },
    onError: (err) => {
      console.log("error", err)
    }
  })

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

  useEffect(() => {
    if (activeChatroom && user) {
      const foundUser = activeChatroom.users.find((x) => x.user_id === user.id)
      if (foundUser && !foundUser.is_message_seen) {
        console.log("#CHECKRENDERING Should trigger")
        triggerReadMessagesMutation.mutate(foundUser.id)
      }
    }
  }, [activeChatroom, user])

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
    // if (messages) {
    //   messages.length === 0 ? setIsMessagesLoading(false) : loadMessages(messages)
    // }
    if (messages) loadMessages(messages)
  }, [messages, loadMessages])

  useEffect(() => {
    return () => {
      setActiveChatroom(null)
      setShowDetails(false)
    }
  }, [setActiveChatroom, setShowDetails])

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

export default useChatMessages
