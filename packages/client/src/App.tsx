import { SignedIn, SignedOut, RedirectToSignIn, SignIn, SignUp, useUser, useAuth } from "@clerk/clerk-react"
import { Route, Routes, useLocation } from "react-router-dom"
import Header from "./components/header/Header"
import Inbox from "./pages/chat/Inbox"
import Dashboard from "./pages/dashboard/Dashboard"
import { ToastContainer } from "react-toastify"
import LoadingPage from "./pages/LoadingPage"
import Modals from "./components/modals/Modals"
import { trpc } from "./lib/trpcClient"
import { useEffect, useState } from "react"
import { isImage, loadImage } from "./utils/image"
import { Tables } from "../../server/src/types/supabase"
import useChatSocket from "./hooks/useChatSocket"
import useGeneralStore from "./stores/generalStore"
import "react-toastify/dist/ReactToastify.css"
import Home from "./pages/home/Home"
import ErrorPage from "./pages/ErrorPage"
import useChatStore from "./stores/chatStore"
import RTCVoiceCall from "./pages/chat/components/RTCVoiceCall"
import { socket } from "./lib/socket"

function App() {
  const { user } = useUser()
  const { isSignedIn } = useAuth()
  const ctx = trpc.useUtils()
  const { setUsername } = useGeneralStore((state) => state.actions)
  const username = useGeneralStore((state) => state.username)
  const location = useLocation()
  const [isFetched, setIsFetched] = useState<boolean>(false)
  const [hideHeader, setHideHeader] = useState<boolean>(false)
  const { setUnreadMessagesCount } = useChatStore((state) => state.actions)
  useChatSocket(socket)

  useEffect(() => {
    if (!user || !user.username) return
    setUsername(user.username)
  }, [user])

  const { data: userData } = trpc.user.get.useQuery(
    { data: username!, type: "username" },
    { enabled: !!username && !!isSignedIn }
  )

  const createUserMutation = trpc.user.create.useMutation({
    mutationKey: [username],
    onSuccess: (data) => {
      if (!data || !user?.username) return
      ctx.user.get.setData({ data: user.username, type: "username" }, data)
    }
  })

  const createUser = async () => {
    if (!user) return
    const { firstName, lastName, username } = user
    if (!firstName || !lastName || !username) throw new Error("No credentials")
    createUserMutation.mutate({
      firstName,
      lastName,
      username,
      email: user.emailAddresses[0].emailAddress
    })
  }

  const loadPosts = async (posts: Tables<"posts">[]) => {
    await Promise.all(posts.filter((x) => isImage(x.media_url)).map(async (x) => await loadImage(x.media_url)))
    setIsFetched(true)
  }

  useEffect(() => {
    if (userData === null) createUser()
    if (userData) {
      const { posts, unread_messages_count } = userData
      loadPosts(posts)
      setUnreadMessagesCount(unread_messages_count)
    }
  }, [userData])

  useEffect(() => {
    if (location.pathname.startsWith("/call")) setHideHeader(true)
    return () => {
      setHideHeader(false)
    }
  }, [location])

  return (
    <>
      <SignedIn>
        {!isFetched ? (
          <LoadingPage />
        ) : (
          <>
            {!hideHeader && <Header />}
            <Routes location={location}>
              <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
              <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />
              <Route path="/" element={<Home />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/inbox/:chatroomId" element={<Inbox />} />
              <Route path="/:username" element={<Dashboard />} />
              <Route path="/call/:chatroomId" element={<RTCVoiceCall />} />
              <Route path="*" element={<ErrorPage />} />
            </Routes>
            <Modals />
            <ToastContainer position={"bottom-right"} className="font-bold" />
            <audio id="source1" />
            <audio id="sourc2" />
          </>
        )}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}

export default App
