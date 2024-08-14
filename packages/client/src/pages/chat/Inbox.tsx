import { useLocation, useParams } from "react-router-dom"
import useChatStore from "../../stores/chatStore"
import UserChats from "./components/UserChats"
import Chat from "./components/Chat"
import ChatDetails from "./components/ChatDetails"
import { cn } from "../../utils/utils"
import useGeneralStore from "../../stores/generalStore"
import MainContainer from "../../components/MainContainer"
import Icon from "../../components/Icon"
import Button from "../../components/Button"
import useModalStore from "../../stores/modalStore"
import useUser from "../../hooks/useUser"
import { useEffect } from "react"

const Inbox = () => {
  const location = useLocation()
  const { chatroomId } = useParams<{ chatroomId: string }>()
  const isMobile = useGeneralStore((state) => state.isMobile)
  const { openModal } = useModalStore((state) => state.actions)
  const { activeChatroom, showDetails } = useChatStore((state) => ({
    activeChatroom: state.activeChatroom,
    activeChatroomTitle: state.activeChatroomTitle,
    showDetails: state.showDetails
  }))
  const { setActiveChatroom, setActiveChatroomTitle } = useChatStore((state) => state.actions)
  const { user, userChats, areChatsLoading } = useUser()

  useEffect(() => {
    if (!userChats || !user) return
    const activeChat = userChats.find((chat) => chat.chatroom_id === chatroomId)
    if (activeChat) {
      setActiveChatroom(activeChat)
      setActiveChatroomTitle(
        activeChat.users
          .filter((chat) => chat.username !== user.username)
          .map((chat) => chat.username)
          .join(", ")
      )
    }
  }, [userChats, user, chatroomId])

  return (
    <MainContainer>
      <div className={cn("flex h-[100svh] w-full items-center", isMobile ? "pb-16" : "pl-20")}>
        {(!chatroomId || (chatroomId && !isMobile)) && <UserChats />}
        {user && location.pathname !== "/inbox" && activeChatroom && (
          <Chat activeChatroom={activeChatroom} user={user} />
        )}
        {showDetails && activeChatroom && <ChatDetails />}
        {!isMobile && location.pathname === "/inbox" && (
          <div className="flex h-full w-full flex-col items-center justify-center text-center">
            {areChatsLoading ? (
              <>
                <div className="h-[100px] w-[100px] animate-pulse rounded-full bg-neutral-800 pb-6"></div>
                <div className="flex h-max flex-col items-center space-y-3 pt-4">
                  <div className="h-4 w-40 animate-pulse rounded-xl bg-neutral-800"></div>
                  <div className="h-4 w-60 animate-pulse rounded-xl bg-neutral-800 pt-1"></div>
                  <div className="h-8 w-28 animate-pulse rounded-xl bg-neutral-800"></div>
                </div>
              </>
            ) : (
              <>
                <Icon
                  name="MessageCircle"
                  size="100px"
                  className="cursor-default rounded-full border-2 border-white p-6"
                />
                <div className="flex h-max flex-col items-center pt-4">
                  <h3 className="text-xl">Your Messages</h3>
                  <p className="py-3 pt-1 text-neutral-400">Send private photos and messages to a friend</p>
                  <Button buttonColor="blue" onClick={() => openModal("newmessage")} className="text-sm">
                    Send message
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </MainContainer>
  )
}

export default Inbox
