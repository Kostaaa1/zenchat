import { useAuth, useUser as useClerkUser } from "@clerk/clerk-react"
import { trpc } from "../lib/trpcClient"
import { useEffect, useState } from "react"
import { isImage, loadImage } from "../utils/image"
import useUserStore from "../stores/userStore"
import useChatMapStore from "../stores/chatMapStore"
import { TUserData } from "../../../server/src/types/types"
import useUser from "./useUser"
import useChatStore from "../stores/chatStore"

const useApp = () => {
  const { user: clerkUser } = useClerkUser()
  const { user, userChats } = useUser()
  const { isSignedIn, getToken } = useAuth()
  const ctx = trpc.useUtils()
  const [isFetched, setIsFetched] = useState<boolean>(false)
  const activeChatroom = useChatStore((state) => state.activeChatroom)
  const { inputImages, inputMessages } = useChatMapStore((state) => ({
    inputImages: state.inputImages,
    inputMessages: state.inputMessages
  }))
  const { setUnreadChatIds } = useUserStore((state) => state.actions)
  const { setAreChatsLoading, setSessionToken, setUser, setUserChats } = useUserStore((state) => state.actions)
  const { data: userData } = trpc.user.get.useQuery(
    { data: clerkUser?.username ?? "", type: "username" },
    { enabled: !!clerkUser && !!isSignedIn }
  )

  const createUserMutation = trpc.user.create.useMutation({
    mutationKey: [clerkUser?.username],
    onSuccess: (data) => {
      if (!data || !clerkUser || !clerkUser.username) return
      ctx.user.get.setData({ data: clerkUser.username, type: "username" }, data)
    }
  })

  const createUser = async () => {
    if (!clerkUser) return
    const { firstName, lastName, username } = clerkUser
    if (!firstName || !lastName || !username) throw new Error("No credentials")
    createUserMutation.mutate({
      firstName,
      lastName,
      username,
      email: clerkUser.emailAddresses[0].emailAddress
    })
  }

  const loadPosts = async (data: TUserData) => {
    const { posts, image_url } = data
    const filtered = posts.filter((x) => isImage(x.media_url))
    await Promise.all(filtered.map(async (x) => await loadImage(x.media_url)))
    if (image_url) await loadImage(image_url)
    setUser(data)
    setIsFetched(true)
  }

  useEffect(() => {
    if (userData === null) createUser()
    if (userData) loadPosts(userData)
  }, [userData])

  //////////////////////////////
  const { data } = trpc.chat.get.user_chatrooms.useQuery(userData?.id, {
    enabled: !!userData,
    refetchOnReconnect: "always",
    refetchOnMount: "always"
  })

  useEffect(() => {
    const preparation = async () => {
      if (!user || !data) return
      const filtered = data?.filter((x) => x.users.some((y) => y.username === user?.username && y.is_active))
      if (filtered) {
        await Promise.all(
          filtered.map(async ({ users, chatroom_id }) => {
            inputMessages.set(chatroom_id, "")
            inputImages.set(chatroom_id, [])
            await Promise.all(users.map(async ({ image_url }) => image_url && loadImage(image_url)))
          })
        )
        setUserChats(filtered)
        setAreChatsLoading(false)
      }
    }
    preparation()
  }, [user, data])

  useEffect(() => {
    if (!userChats || !user) return
    const splitPath = location.pathname.split("/")
    if (splitPath.length > 2 && splitPath[2] === activeChatroom?.chatroom_id) return

    const unreadIds = userChats
      .flatMap(({ users }) => users.filter(({ user_id, is_message_seen }) => user_id === user.id && !is_message_seen))
      .map(({ user_id }) => user_id)
    setUnreadChatIds(unreadIds)
  }, [userChats, user, activeChatroom])

  useEffect(() => {
    const fetchToken = async () => {
      const fetchedToken = await getToken()
      if (fetchedToken) setSessionToken(fetchedToken)
    }
    fetchToken()
  }, [])

  return {
    isFetched
  }
}

export default useApp
