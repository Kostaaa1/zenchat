import Icon from "../../../components/Icon"
import List from "../../../components/List"
import useModalStore from "../../../stores/modalStore"
import useUser from "../../../hooks/useUser"
import { cn } from "../../../utils/utils"
import useGeneralStore from "../../../stores/generalStore"
import useChatStore from "../../../stores/chatStore"
import { useNavigate, useParams } from "react-router-dom"

const UserChats = () => {
  const { user, userChats, areChatsLoading: isLoading } = useUser()
  const { openModal } = useModalStore((state) => state.actions)
  const navigate = useNavigate()
  const params = useParams<{ chatroomId: string }>()
  const isMobile = useGeneralStore((state) => state.isMobile)
  const { setShowDetails, setActiveChatroom, setShouldFetchMoreMessages } = useChatStore((state) => state.actions)

  const handleChatUserClick = (chatroom_id: string) => {
    if (params.chatroomId === chatroom_id) return
    setShouldFetchMoreMessages(true)
    setShowDetails(false)
    setActiveChatroom(null)
    navigate(`/inbox/${chatroom_id}`)
  }

  return (
    <div className={cn("flex h-full w-full flex-col border-r border-[#262626] bg-black", isMobile ? "" : "max-w-sm")}>
      <div
        className={cn(
          "flex h-full max-h-[90px] items-center justify-between border-b border-[#262626]",
          isMobile ? "h-[70px] p-4" : "h-full p-6"
        )}
      >
        <div className="flex cursor-pointer items-center active:text-zinc-500">
          <h1 className="mr-1 text-xl font-bold"> {user?.username} </h1>
          <Icon name="ChevronDown" size="20px" />
        </div>
        <Icon name="PenSquare" size="22px" onClick={() => openModal("newmessage")} className="active:text-zinc-500" />
      </div>
      <ul className="h-full overflow-y-auto">
        {isLoading &&
          Array(2)
            .fill("")
            .map((_, id) => <List key={id} padding={isMobile ? "md" : "lg"} isLoading={isLoading} />)}
        {!isLoading && (
          <>
            {userChats?.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-neutral-400">No messages found.</p>
              </div>
            ) : (
              <>
                {userChats?.map(({ chatroom_id, last_message, users, is_group }) => (
                  <List
                    key={chatroom_id}
                    isHoverDisabled={true}
                    hover="darker"
                    subtitle={last_message}
                    padding={isMobile ? "md" : "lg"}
                    isLoading={isLoading}
                    onClick={() => handleChatUserClick(chatroom_id)}
                    avatarSize="lg"
                    isRead={users.find((x) => x.user_id === user?.id)?.is_message_seen}
                    isOnline={users.filter((x) => x.username !== user?.username)[0].is_socket_active && !is_group}
                    className={cn("h-20", params.chatroomId === chatroom_id && "bg-white bg-opacity-10")}
                    title={users
                      .filter((x) => x.username !== user?.username)
                      .map((x) => x.username)
                      .join(", ")}
                    image_url={
                      is_group && users.length > 1
                        ? [users[0].image_url, users[1].image_url]
                        : [users.find((x) => x.user_id !== user?.id)?.image_url]
                    }
                  />
                ))}
              </>
            )}
          </>
        )}
      </ul>
    </div>
  )
}

export default UserChats
