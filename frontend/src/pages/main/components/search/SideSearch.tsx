import { motion } from "framer-motion";
import Search from "./Search";
import useStore from "../../../../utils/store";
import { useState } from "react";
import ChatList from "../../../../components/ChatList";
import { useNavigate } from "react-router-dom";

const SideSearch = () => {
  const { setIsSearchActive, searchedUsers } = useStore();
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleListClick = (route: string) => {
    navigate(route);
    setIsSearchActive(false);
  };

  return (
    <motion.div
      className="fixed left-[80px] top-0 z-10 h-full w-[420px] overflow-hidden border-r border-[#262626] bg-[#000000]"
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ type: "spring", damping: 35, stiffness: 280 }}
    >
      <div className="flex h-[140px] flex-col justify-between border-b border-[#262626] p-6">
        <h1 className="text-3xl font-bold">Search</h1>
        <Search setLoading={setLoading} />
      </div>
      {!loading ? (
        <div className="h-full max-h-full">
          {searchedUsers.length > 0 ? (
            <div className="">
              {searchedUsers.map((user) => (
                <ChatList
                  image_url={user?.image_url}
                  hover="darker"
                  key={user.id}
                  subtitle={`${user.first_name} ${user.last_name}`}
                  title={user.username}
                  onClick={() => handleListClick(`/${user?.username}`)}
                />
              ))}
            </div>
          ) : (
            <div>
              <h3 className="p-6 text-lg font-semibold">Recent</h3>
              <div className="flex items-center justify-center py-10"></div>
            </div>
          )}
        </div>
      ) : (
        Array(12)
          .fill("")
          .map((_, id) => (
            <div key={id} className="flex w-full items-center px-6 py-2">
              <div className="block h-16 w-16 rounded-full bg-neutral-800"></div>
              <div className="ml-4 flex h-full flex-col justify-between py-[6px]">
                <div className="mb-2 h-4 w-[240px] rounded-lg bg-neutral-800"></div>
                <div className="h-4 w-[80px] rounded-lg bg-neutral-800"> </div>
              </div>
            </div>
          ))
      )}
    </motion.div>
  );
};

export default SideSearch;
