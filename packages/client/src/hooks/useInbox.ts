import { useCallback, useEffect, useState } from "react"
import useChatStore from "../stores/chatStore"
import useUser from "./useUser"
import { trpc } from "../lib/trpcClient"
import useChatMapStore from "../stores/chatMapStore"
import { loadImage } from "../utils/image"
import { useParams } from "react-router-dom"
import { TChatroom } from "../../../server/src/types/types"

const useInbox = () => {
  const { chatroomId } = useParams<{ chatroomId: string }>()
  const { userData } = useUser()
  const inputImages = useChatMapStore((state) => state.inputImages)
  const inputMessages = useChatMapStore((state) => state.inputMessages)
  const [isUserChatsLoading, setIsUserChatsLoading] = useState<boolean>(true)
  const { setActiveChatroom, setActiveChatroomTitle } = useChatStore((state) => state.actions)
  const [userChats, setUserChats] = useState<TChatroom[]>([])
  const { data } = trpc.chat.get.user_chatrooms.useQuery(userData!.id, {
    enabled: !!userData,
    refetchOnReconnect: "always",
    refetchOnMount: "always"
  })

  const prep = useCallback(async () => {
    if (!userData) return
    const filteredChats = data?.filter((x) => x.users.some((y) => y.username === userData?.username && y.is_active))
    if (filteredChats) {
      await Promise.all(
        filteredChats.map(({ users, chatroom_id }) => {
          inputMessages.set(chatroom_id, "")
          inputImages.set(chatroom_id, [])
          return users.map(async ({ image_url }) => image_url && loadImage(image_url))
        })
      )
      setIsUserChatsLoading(false)
      setUserChats(filteredChats)
      const activeChat = userChats.find((chat) => chat.chatroom_id === chatroomId)
      if (activeChat) {
        setActiveChatroom(activeChat)
        setActiveChatroomTitle(
          activeChat.users
            .filter((chat) => chat.username !== userData.username)
            .map((chat) => chat.username)
            .join(", ")
        )
      }
    }
  }, [chatroomId, data, inputImages, inputMessages, userChats, userData])

  useEffect(() => {
    prep()
  }, [userData, prep])

  return {
    userChats,
    isUserChatsLoading
  }
}

export default useInbox
