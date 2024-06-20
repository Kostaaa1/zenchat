import "react-toastify/dist/ReactToastify.css"
import { SignedIn, SignedOut, RedirectToSignIn, SignIn, SignUp } from "@clerk/clerk-react"
import { Route, Routes } from "react-router-dom"
import Header from "./components/header/Header"
import Inbox from "./pages/chat/Inbox"
import Dashboard from "./pages/dashboard/Dashboard"
import { ToastContainer } from "react-toastify"
import LoadingPage from "./pages/LoadingPage"
import Modals from "./components/modals/Modals"
import { useEffect, useState } from "react"
import useChatSocket from "./hooks/useChatSocket"
import Home from "./pages/home/Home"
import ErrorPage from "./pages/ErrorPage"
import RTCVoiceCall from "./pages/chat/components/RTCVoiceCall"
import { socket } from "./lib/socket"
import useApp from "./hooks/useApp"

function App() {
  useChatSocket(socket)
  const [hideHeader, setHideHeader] = useState<boolean>(false)
  const { isFetched } = useApp()

  useEffect(() => {
    if (location.pathname.startsWith("/call")) setHideHeader(true)
    return () => {
      setHideHeader(false)
    }
  }, [])

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
            <audio id="source2" />
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
