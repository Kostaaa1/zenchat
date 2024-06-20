import { FC } from "react"
import useUser from "../../hooks/useUser"
import List from "../List"
import Icon from "../Icon"
import { Loader2 } from "lucide-react"
import { trpc } from "../../lib/trpcClient"
import useGeneralStore from "../../stores/generalStore"
import useWindowSize from "../../hooks/useWindowSize"

interface RecentSearchedUsersProps {
  navigateToUserDashboard: (username: string) => void
}
const RecentSearchedUsers: FC<RecentSearchedUsersProps> = ({ navigateToUserDashboard }) => {
  const { chat } = trpc.useUtils()
  const isMobile = useGeneralStore((state) => state.isMobile)
  const { user } = useUser()
  const { width } = useWindowSize()
  const removeUserMutation = trpc.chat.history.removeUser.useMutation()
  const clearChatHistoryMutation = trpc.chat.history.clearChatHistory.useMutation()

  const { data: searchedChats, isLoading } = trpc.chat.history.getAll.useQuery(user!.id, {
    enabled: !!user?.id
  })

  const handleDeleteSingleChat = async (user_id: string) => {
    if (!user) return
    chat.history.getAll.setData(user.id, (prevData) => {
      return prevData?.filter((data) => data.user_id !== user_id)
    })
    await removeUserMutation.mutateAsync(user_id)
  }

  const handleDeleteAll = async () => {
    try {
      chat.history.getAll.setData(user!.id, [])
      clearChatHistoryMutation.mutate(user!.id)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex select-none items-center justify-between px-6 py-3 font-semibold">
        <h3>Recent</h3>
        {searchedChats && searchedChats?.length > 0 ? (
          <p onClick={handleDeleteAll} className="cursor-pointer text-sm text-blue-500 hover:text-blue-300">
            Clear All
          </p>
        ) : null}
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        </div>
      ) : (
        <ul className="flex h-full flex-col justify-start">
          {searchedChats && searchedChats.length > 0 ? (
            <>
              {searchedChats?.map((chat) => (
                <List
                  key={chat.id}
                  hover="darker"
                  padding={isMobile ? "md" : "lg"}
                  avatarSize={width > 480 ? "lg" : "md"}
                  isHoverDisabled={true}
                  image_url={[chat.users!.image_url]}
                  onIconClick={() => handleDeleteSingleChat(chat.user_id)}
                  onClick={() => navigateToUserDashboard(chat?.users!.username)}
                  title={chat.users!.username}
                  icon={<Icon name="X" size="28px" />}
                  subtitle={`${chat.users!.first_name} ${chat.users!.last_name}`}
                />
              ))}
            </>
          ) : (
            <div className="flex h-full items-center justify-center px-6 pb-3">
              <p className="text-md font-semibold text-neutral-400">No recent searches</p>
            </div>
          )}
        </ul>
      )}
    </div>
  )
}

export default RecentSearchedUsers
