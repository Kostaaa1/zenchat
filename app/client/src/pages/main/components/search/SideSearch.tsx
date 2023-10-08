import { motion } from "framer-motion";
import Search from "./Search";
import useStore from "../../../../utils/stores/store";
import { useState } from "react";
import ChatList from "../../../../components/ChatList";
import { useNavigate } from "react-router-dom";
import useUser from "../../../../hooks/useUser";
import RecentSearchedUsers from "./RecentSearchedUsers";
import { cn } from "../../../../utils/utils";
import { trpcVanilla } from "../../../../utils/trpcClient";

const SideSearch = () => {
  const { search, setIsSearchActive, searchedUsers } = useStore();
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { userData } = useUser();

  const navigateToUserDashboard = (username: string) => {
    navigate(`/${username}`);
    setIsSearchActive(false);
  };

  const handleListClick = async ({
    username,
    id,
  }: {
    username: string;
    id: string;
  }) => {
    try {
      if (!username && !id) return;
      navigateToUserDashboard(username);

      await trpcVanilla.chat.history.addUser.mutate({
        main_user_id: userData?.id as string,
        user_id: id,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <motion.div
      className="fixed left-[80px] top-0 z-10 flex h-full w-full max-w-[400px] flex-col border-r border-[#262626] bg-black"
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ type: "spring", damping: 45, stiffness: 280 }}
    >
      <div className="flex h-full max-h-[140px] w-full flex-col justify-between border-b border-[#262626] p-6">
        <h1 className="text-3xl font-bold">Search</h1>
        <Search setLoading={setLoading} />
      </div>
      <div
        className={cn(
          "h-full w-full",
          !loading ? "overflow-y-auto" : "overflow-hidden",
        )}
      >
        {!loading ? (
          <>
            {search.length === 0 || searchedUsers.length === 0 ? (
              <RecentSearchedUsers
                navigateToUserDashboard={navigateToUserDashboard}
              />
            ) : (
              <>
                {searchedUsers.length !== 0 ? (
                  <div>
                    {searchedUsers.map((user) => (
                      <ChatList
                        title={user?.username}
                        key={user?.id}
                        image_url={user?.image_url}
                        hover="darker"
                        subtitle={`${user?.first_name} ${user?.last_name}`}
                        avatarSize="md"
                        onClick={() => {
                          const { username, id } = user;
                          handleListClick({
                            username,
                            id,
                          });
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="border-1 flex h-full max-h-full w-full items-center justify-center">
                    No results found.
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          Array(12)
            .fill("")
            .map((_, id) => (
              <div
                key={id}
                className="flex animate-pulse items-center px-6 py-2"
              >
                <div className="block h-16 w-16 rounded-full bg-neutral-800"></div>
                <div className="ml-4 flex h-full flex-col justify-between py-[6px]">
                  <div className="mb-2 h-4 w-[240px] rounded-lg bg-neutral-800"></div>
                  <div className="h-4 w-[80px] rounded-lg bg-neutral-800">
                    {" "}
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </motion.div>
  );
};

export default SideSearch;
