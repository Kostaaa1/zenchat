import { FC } from "react";
import useUser from "../../hooks/useUser";
import List from "../List";
import Icon from "../Icon";
import { Loader2 } from "lucide-react";
import { trpc } from "../../utils/trpcClient";

interface RecentSearchedUsersProps {
  navigateToUserDashboard: (username: string) => void;
}

const RecentSearchedUsers: FC<RecentSearchedUsersProps> = ({
  navigateToUserDashboard,
}) => {
  const { chat } = trpc.useUtils();
  const { userData } = useUser();
  const removeUserMutation = trpc.chat.history.removeUser.useMutation();
  const clearChatHistoryMutation =
    trpc.chat.history.clearChatHistory.useMutation();
  const { data: searchedChats, isLoading } = trpc.chat.history.getAll.useQuery(
    userData!.id,
    {
      enabled: !!userData?.id,
    },
  );

  const handleDeleteSingleChat = async (user_id: string) => {
    chat.history.getAll.setData(userData!.id, (prevData) => {
      return prevData?.filter((data) => data.user_id !== user_id);
    });
    await removeUserMutation.mutateAsync(user_id);
  };

  const handleDeleteAll = async () => {
    try {
      chat.history.getAll.setData(userData!.id, []);
      clearChatHistoryMutation.mutate(userData!.id);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex select-none items-center justify-between p-6 py-2 font-semibold md:py-6">
        <h3>Recent</h3>
        {searchedChats && searchedChats?.length > 0 ? (
          <p
            onClick={handleDeleteAll}
            className="cursor-pointer text-sm text-blue-500 hover:text-blue-300"
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
                <List
                  key={chat.id}
                  isHoverDisabled={true}
                  image_url={[chat.users!.image_url]}
                  onIconClick={() => handleDeleteSingleChat(chat.user_id)}
                  onClick={() => navigateToUserDashboard(chat?.users!.username)}
                  hover="darker"
                  title={chat.users!.username}
                  subtitle={`${chat.users!.first_name} ${chat.users!.last_name}`}
                  icon={<Icon name="X" size="28px" />}
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