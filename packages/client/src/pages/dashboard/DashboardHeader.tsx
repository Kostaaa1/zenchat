import { useNavigate } from "react-router-dom"
import Button from "../../components/Button"
import { trpc } from "../../lib/trpcClient"
import { useState } from "react"
import { TUserData } from "../../../../server/src/types/types"
import useUser from "../../hooks/useUser"
import Avatar from "../../components/avatar/Avatar"
import useModalStore from "../../stores/modalStore"
import useGeneralStore from "../../stores/generalStore"
import { Settings } from "lucide-react"

export const DashboardHeader = ({
  userData,
  username
}: {
  userData: TUserData | undefined | null
  username: string | undefined
}) => {
  const navigate = useNavigate()
  const { user: loggedUser, logout } = useUser()
  const isMobile = useGeneralStore((state) => state.isMobile)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const isAvatarUpdating = useModalStore((state) => state.isAvatarUpdating)
  const utils = trpc.useUtils()
  const { openModal, setImageSource, setOptions } = useModalStore((state) => state.actions)

  const handleGetChatRoomId = async () => {
    if (!userData || !loggedUser) return
    setIsLoading(true)
    await utils.chat.get.user_chatrooms.invalidate(loggedUser.id)
    const chatroomIdQuery = {
      userIds: [userData.id, loggedUser.id],
      admin: loggedUser.id
    }
    await utils.chat.get.chatroom_id.invalidate(chatroomIdQuery)
    const path = await utils.chat.get.chatroom_id.fetch(chatroomIdQuery)
    if (path) {
      setIsLoading(false)
      navigate(`/inbox/${path}`)
    }
  }

  const handleClick = () => {
    if (!isAvatarUpdating && userData && userData.image_url) {
      setImageSource(userData.image_url)
      openModal("image")
    }
  }

  const userSettings = [
    {
      id: 0,
      child: <p>Logout</p>,
      className: "",
      onClick: logout,
      condition: true
    }
  ]

  return (
    <div className="flex h-max max-w-full items-center justify-start py-4 pb-8 md:justify-center">
      <div className="relative flex items-center pr-6 sm:justify-start md:mb-0">
        <Avatar
          onClick={handleClick}
          image_url={userData?.image_url}
          size={isMobile ? "xl" : "xxl"}
          enableHover={true}
          isLoading={isAvatarUpdating}
        />
      </div>
      <div className="flex flex-col space-y-3 p-0">
        <div className="flex flex-wrap items-center justify-between space-y-1">
          <div className="flex items-center">
            <h1 className="pr-2 text-2xl">{userData?.username}</h1>
          </div>
          {username !== userData?.username ? (
            <Button isLoading={isLoading} onClick={handleGetChatRoomId}>
              Message
            </Button>
          ) : (
            <div className="flex flex-wrap items-center space-x-1">
              <Button onClick={() => openModal("editprofile")} className="text-xs sm:text-sm">
                Edit profile
              </Button>
              <Button onClick={() => openModal("uploadpost")} className="text-xs sm:text-sm">
                New post
              </Button>
              {isMobile && (
                <Settings
                  className="cursor-pointer duration-500 active:rotate-180"
                  onClick={() => setOptions(userSettings)}
                />
              )}
            </div>
          )}
        </div>
        <div>
          <h4 className="font-semibold">{`${userData?.first_name} ${userData?.last_name}`}</h4>
          <span>{userData?.description ?? ""}</span>
        </div>
      </div>
    </div>
  )
}
