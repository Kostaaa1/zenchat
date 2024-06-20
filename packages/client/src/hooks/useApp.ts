import { useAuth, useUser } from "@clerk/clerk-react"
import { trpc } from "../lib/trpcClient"
import { useEffect, useState } from "react"
import { isImage, loadImage } from "../utils/image"
import useUserStore from "../stores/userStore"
import useChatMapStore from "../stores/chatMapStore"
import { TUserData } from "../../../server/src/types/types"

const useApp = () => {
  // const [username, setUsername] = useState<string | null>(null)
  const { user: clerkUser } = useUser()
  const { isSignedIn, getToken } = useAuth()
  const ctx = trpc.useUtils()
  const [isFetched, setIsFetched] = useState<boolean>(false)
  const { inputImages, inputMessages } = useChatMapStore((state) => ({
    inputImages: state.inputImages,
    inputMessages: state.inputMessages
  }))

  // const {  setUnreadChatIds } = useUserStore(
  //   (state) => state.actions
  // )

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
    console.log("posts lodaed", filtered)
    setUser(data)
    setIsFetched(true)
  }

  useEffect(() => {
    console.log("userData", userData)
    if (userData === null) createUser()
    if (userData) {
      loadPosts(userData)
    }
  }, [userData])

  //////////////////////////////
  const { data } = trpc.chat.get.user_chatrooms.useQuery(userData?.id, {
    enabled: !!userData,
    refetchOnReconnect: "always",
    refetchOnMount: "always"
  })

  useEffect(() => {
    const prep = async () => {
      if (!userData || !data) return
      console.log("prep ran......")
      const filteredChats = data?.filter((x) => x.users.some((y) => y.username === userData?.username && y.is_active))

      if (filteredChats) {
        await Promise.all(
          filteredChats.map(async ({ users, chatroom_id }) => {
            inputMessages.set(chatroom_id, "")
            inputImages.set(chatroom_id, [])
            await Promise.all(users.map(async ({ image_url }) => image_url && loadImage(image_url)))
          })
        )
        setAreChatsLoading(false)
        setUserChats(filteredChats)
      }
    }
    prep()
  }, [userData, data])

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
