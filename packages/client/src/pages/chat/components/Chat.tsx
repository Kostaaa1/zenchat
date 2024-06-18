import React, { FC, useEffect, useRef } from "react"
import Button from "../../../components/Button"
import { TChatroom } from "../../../../../server/src/types/types"
import { Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import useChatStore from "../../../stores/chatStore"
import { debounce } from "lodash"
import useUser from "../../../hooks/useUser"
import RenderAvatar from "../../../components/avatar/RenderAvatar"
import Message from "./Message"
import useModalStore from "../../../stores/modalStore"
import MessageInput from "./MessageInput"
import ChatHeader from "./ChatHeader"
import useGeneralStore from "../../../stores/generalStore"
import { cn } from "../../../utils/utils"
import useChat from "../../../hooks/useChat"

type ChatProps = {
  scrollRef: React.RefObject<HTMLDivElement>
  activeChatroom: TChatroom
}

const Chat: FC<ChatProps> = ({ scrollRef, activeChatroom }) => {
  const iconRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { userData } = useUser()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { messages, getMoreMutation } = useChat()
  const { activeChatroomTitle, lastMessageDate } = useChatStore((state) => ({
    activeChatroomTitle: state.activeChatroomTitle,
    lastMessageDate: state.lastMessageDate
  }))
  const isMobile = useGeneralStore((state) => state.isMobile)
  const { activeMessage } = useModalStore((state) => ({
    activeMessage: state.activeMessage
  }))
  const { setActiveMessage } = useModalStore((state) => state.actions)
  const { isLoading, shouldFetchMoreMessages } = useChatStore((state) => ({
    isLoading: state.isMessagesLoading,
    shouldFetchMoreMessages: state.shouldFetchMoreMessages
  }))
  const scrollToStart = () => scrollRef.current?.scrollTo({ top: 0 })

  useEffect(() => {
    const container = scrollRef.current
    if (!container || !activeChatroom) return
    const fetchMoreMessagesObserver = debounce(() => {
      const { scrollTop, clientHeight, scrollHeight } = container
      const scrollTolerance = 40
      const diff = scrollHeight - clientHeight - scrollTolerance
      if (Math.abs(scrollTop) >= diff && shouldFetchMoreMessages) {
        getMoreMutation({
          chatroom_id: activeChatroom?.chatroom_id,
          lastMessageDate
        })
      }
    }, 300)
    container.addEventListener("scroll", fetchMoreMessagesObserver)
    return () => {
      container.removeEventListener("scroll", fetchMoreMessagesObserver)
      fetchMoreMessagesObserver.cancel()
    }
  })

  return (
    <div className={cn("relative flex h-full w-full flex-col justify-between", !isMobile && "pb-2")}>
      <>
        <ChatHeader chat={activeChatroom} />
        {isLoading ? (
          <div className="flex h-full w-full justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
          </div>
        ) : (
          <div
            className="flex h-full flex-col-reverse justify-between overflow-x-hidden overflow-y-scroll"
            ref={scrollRef}
          >
            <ul className={cn("mb-2 flex flex-col-reverse", isMobile ? "px-2" : "px-4")}>
              {messages?.map((message, id) => (
                <Message
                  key={message.id}
                  ref={dropdownRef}
                  message={message}
                  onClick={() => setActiveMessage(!activeMessage ? message : null)}
                  rounded1={
                    id + 1 < messages.length
                      ? messages[id + 1].sender_id !== message.sender_id
                      : id === messages.length - 1
                  }
                  rounded2={(id - 1 >= 0 && messages[id - 1].sender_id !== message.sender_id) || id === 0}
                />
              ))}
            </ul>
            {shouldFetchMoreMessages && (
              <div className="flex w-full items-center justify-center py-4">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
              </div>
            )}
            {!shouldFetchMoreMessages && activeChatroom && (
              <div className="mt-8 flex flex-col items-center">
                <RenderAvatar
                  avatarSize="xl"
                  image_urls={
                    activeChatroom.is_group
                      ? {
                          image_url_1: activeChatroom.users[0]?.image_url,
                          image_url_2: activeChatroom.users[1]?.image_url
                        }
                      : {
                          image_url_1: activeChatroom.users.find((x) => x.user_id !== userData?.id)?.image_url
                        }
                  }
                />
                <div className={cn("flex flex-col items-center ", activeChatroom.is_group ? "pt-12" : "pt-4")}>
                  <h3 className="text-md py-1 font-semibold">
                    {activeChatroom && activeChatroom?.users.length > 1
                      ? activeChatroomTitle
                      : activeChatroom?.users[0].username}
                  </h3>
                  {!activeChatroom?.is_group ? (
                    <Button
                      size="sm"
                      className="text-sm font-semibold"
                      onClick={() => navigate(`/${activeChatroom?.users[0].username}`)}
                    >
                      View profile
                    </Button>
                  ) : (
                    <p className="text-sm font-bold text-neutral-400">
                      {/*  */}
                      {userData?.id === activeChatroom.admin
                        ? "You created this group."
                        : `${
                            activeChatroom.users.find((x) => x.id === activeChatroom.admin)?.username
                          } creates this group.`}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {activeChatroom && (
          <MessageInput iconRef={iconRef} activeChatroom={activeChatroom} scrollToStart={scrollToStart} />
        )}
      </>
    </div>
  )
}

const MemoizedChat = React.memo(Chat)
export default MemoizedChat
