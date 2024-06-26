import React, { FC, useEffect, useRef, useState } from "react"
import Button from "../../../components/Button"
import { TChatroom, TUserData } from "../../../../../server/src/types/types"
import { Loader2 } from "lucide-react"
import RenderAvatar from "../../../components/avatar/RenderAvatar"
import Message from "./Message"
import MessageInput from "./MessageInput"
import ChatHeader from "./ChatHeader"
import useGeneralStore from "../../../stores/generalStore"
import { cn } from "../../../utils/utils"
import useChat from "../../../hooks/useChat"

type ChatProps = {
  activeChatroom: TChatroom
  user: TUserData
}

const Chat: FC<ChatProps> = ({ activeChatroom, user }) => {
  const isMobile = useGeneralStore((state) => state.isMobile)
  const iconRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const {
    scrollRef,
    shouldFetchMoreMessages,
    isMessagesLoading,
    activeMessage,
    messages,
    navigate,
    setActiveMessage,
    activeChatroomTitle,
    scrollToStart
  } = useChat()
  const [usersSeenMessage, setUsersSeenMessage] = useState<string[]>([])

  useEffect(() => {
    setUsersSeenMessage(
      activeChatroom.users.filter((x) => x.user_id !== user.id && x.is_message_seen).map((x) => x.username)
    )
  }, [activeChatroom, user])

  return (
    <>
      {user && (
        <div className={cn("relative flex h-full w-full flex-col justify-between", !isMobile && "pb-2")}>
          <>
            <ChatHeader chat={activeChatroom} />
            {!messages || isMessagesLoading ? (
              <div className="flex h-full w-full justify-center py-4">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
              </div>
            ) : (
              <div
                className="flex h-full flex-col-reverse justify-between overflow-x-hidden overflow-y-scroll"
                ref={scrollRef}
              >
                <ul className={cn("mb-2 flex flex-col-reverse", isMobile ? "px-2" : "px-4")}>
                  {messages[0]?.sender_id === user.id && usersSeenMessage.length > 0 && (
                    <p className="flex w-full items-center justify-end text-xs font-semibold text-neutral-500">
                      Seen by {usersSeenMessage.join(", ")}
                    </p>
                  )}
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
                      is_group={activeChatroom.is_group}
                      image_url={
                        activeChatroom.is_group
                          ? activeChatroom.users[0]?.image_url
                          : activeChatroom.users.find((x) => x.user_id !== user?.id)?.image_url
                      }
                      image_url_2={activeChatroom.users[1]?.image_url}
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
                          {user?.id === activeChatroom.admin
                            ? "You created this group."
                            : `${
                                activeChatroom.users.find((x) => x.user_id === activeChatroom.admin)?.username
                              } created this group.`}
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
      )}
    </>
  )
}

const MemoizedChat = React.memo(Chat)
export default MemoizedChat
