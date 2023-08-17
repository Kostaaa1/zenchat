import { motion } from "framer-motion";
import Search from "./Search";
import useStore from "../../../../utils/store";
import { useEffect } from "react";
import { ChatList } from "../../../chat/SideChat";

const SideSearch = () => {
  const { searchedUsers } = useStore();

  useEffect(() => {
    console.log(searchedUsers);
  }, [searchedUsers]);

  return (
    <motion.div
      className="fixed overflow-hidden z-10 top-0 left-[80px] h-full w-[420px] border-r border-[#262626] bg-[#000000]"
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ type: "spring", damping: 35, stiffness: 280 }}
    >
      <div className="p-6 flex flex-col justify-between h-[140px] border-b border-[#262626]">
        <h1 className="text-3xl font-bold">Search</h1>
        <Search />
      </div>
      <div className="h-full p-6">
        <h3 className="text-lg font-semibold">Recent</h3>
        {searchedUsers.length > 0 ? (
          <div className="py-2 flex">
            {searchedUsers.map((user) => (
              <>
                <img
                  className="w-14 h-14 rounded-full"
                  src={user?.imageUrl}
                  alt="user-image"
                />
                <div>
                  <h3> {user?.username} </h3>
                  <p>Yooo</p>
                </div>
              </>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-10"></div>
        )}

        {/* <div className="flex items-center justify-center py-10">
          {searchedUsers.length > 0 ? (
            searchedUsers.map((user) => (
              <ChatList
                imageUrl={user?.imageUrl}
                userName={user.username}
                lastMessage="yoo"
              />
              // </div>
            ))
          ) : (
            <p className="text-neutral-400 font-medium">No recent searches.</p>
          )}
        </div> */}
      </div>
    </motion.div>
  );
};

export default SideSearch;
