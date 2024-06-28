import { Info, Phone } from "lucide-react"
import RenderAvatar from "../../../components/avatar/RenderAvatar"
import useChatStore from "../../../stores/chatStore"
import useUser from "../../../hooks/useUser"
import { useNavigate } from "react-router-dom"
import useGeneralStore from "../../../stores/generalStore"
import Icon from "../../../components/Icon"
import { TChatroom } from "../../../../../server/src/types/types"
import { cn } from "../../../utils/utils"
import { FC } from "react"

const ChatHeader: FC<{ chat: TChatroom }> = ({ chat }) => {
  const { user } = useUser()
  const navigate = useNavigate()
  const isMobile = useGeneralStore((state) => state.isMobile)
  const { activeChatroomTitle, showDetails } = useChatStore((state) => ({
    activeChatroom: state.activeChatroom,
    activeChatroomTitle: state.activeChatroomTitle,
    showDetails: state.showDetails
  }))
  const { setShowDetails, setActiveChatroom } = useChatStore((state) => state.actions)

  const iconSize = 30
  const fillColor = showDetails ? "white" : ""
  const color = showDetails ? "black" : "white"
  const { is_group, users } = chat

  const handleIconClick = () => {
    setShowDetails(!showDetails)
  }

  const navigateToPrevious = () => {
    setActiveChatroom(null)
    navigate("/inbox")
  }

  const handleNavigate = () => {
    is_group ? setShowDetails(true) : navigate(`/${users.find((x) => x.username !== user?.username)?.username}`)
  }

  const callRoom = () => {
    const url = `/call/${chat.chatroom_id}`
    navigate(url)
  }

  return (
    <div
      className={cn(
        "z-10 flex h-[90px] cursor-pointer items-center justify-between border-b border-[#262626] bg-black",
        isMobile ? "pl-2 pr-4" : "px-4 py-6"
      )}
    >
      {isMobile && <div className="flex-[3]">{<Icon name="ArrowLeft" onClick={navigateToPrevious} />}</div>}
      <div className="flex items-center space-x-2" onClick={handleNavigate}>
        {!isMobile && (
          <RenderAvatar avatarSize="md" image_url={users[0]?.image_url} image_url_2={users[1]?.image_url} />
        )}
        <h1 className="text-lg font-semibold">{activeChatroomTitle}</h1>
      </div>
      <div className="flex flex-[3] justify-end space-x-2">
        <Phone
          width={iconSize}
          height={iconSize}
          strokeWidth={1.8}
          strokeLinecap="round"
          className="cursor-pointer"
          onClick={callRoom}
        />
        <Info
          onClick={handleIconClick}
          width={iconSize}
          height={iconSize}
          fill={fillColor}
          color={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          className="cursor-pointer"
        />
      </div>
    </div>
  )
}

export default ChatHeader
