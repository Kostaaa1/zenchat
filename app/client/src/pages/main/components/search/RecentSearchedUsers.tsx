import { FC } from "react";
import useUser from "../../../../hooks/useUser";
import ChatList from "../../../../components/ChatList";
import Icon from "../Icon";
import { Loader2 } from "lucide-react";
import { trpc, trpcVanilla } from "../../../../utils/trpcClient";
import useStore from "../../../../utils/stores/store";

interface RecentSearchedUsersProps {
  navigateToUserDashboard: (username: string) => void;
}

const RecentSearchedUsers: FC<RecentSearchedUsersProps> = ({
  navigateToUserDashboard,
}) => {
  const ctx = trpc.useContext();
  const { userData, userId } = useUser();

  const { data: searchedChats, isLoading } = trpc.chat.history.getAll.useQuery(
    userId,
    {
      enabled: !!userData && !!userId,
    },
  );

  const handleDeleteSingleChat = async (user_id: string) => {
    ctx.chat.history.getAll.setData(userId, (prevData) => {
      return prevData?.filter((data) => data.user_id !== user_id);
    });
    trpcVanilla.chat.history.removeUser.mutate(user_id);
  };

  const handleDeleteAll = async () => {
    try {
      ctx.chat.history.getAll.setData(userId, []);

      if (!userData?.id) return;
      trpcVanilla.chat.history.clearChatHistory.mutate(userData?.id);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="m-6  flex select-none items-center justify-between font-semibold ">
        <h3>Recent</h3>
        {searchedChats && searchedChats?.length > 0 ? (
          <p
            onClick={handleDeleteAll}
            className="cursor-pointer text-sm text-[#538dd8] hover:text-blue-200"
          >
            Clear All
          </p>
        ) : null}
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="flex h-full flex-col justify-start">
          {searchedChats && searchedChats.length > 0 ? (
            <>
              {searchedChats?.map((chat) => (
                <ChatList
                  key={chat.id}
                  isHoverDisabled={true}
                  image_url={chat.users.image_url}
                  onIconClick={() => handleDeleteSingleChat(chat.user_id)}
                  onClick={() => navigateToUserDashboard(chat.users.username)}
                  hover="darker"
                  title={chat.users.username}
                  avatarSize="md"
                  icon={<Icon name="X" size="28px" />}
                  subtitle={`${chat.users.first_name} ${chat.users.last_name}`}
                />
              ))}
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-md font-semibold text-neutral-400">
                No recent searches
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecentSearchedUsers;
