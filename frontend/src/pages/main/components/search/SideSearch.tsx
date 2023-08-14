import { FC } from "react";
import { motion } from "framer-motion";
import Search from "./Search";

interface SideSearchProps {
  activeElement: string;
}

const SideSearch: FC<SideSearchProps> = () => {
  return (
    <motion.div
      // className="fixed overflow-hidden z-10 top-0 left-[260px] h-full w-[400px] border-r rounded-3xl border-[#262626]"
      className="fixed overflow-hidden z-10 top-0 left-[76px] h-full w-[400px] border-r rounded-3xl border-[#262626]"
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ type: "spring", damping: 35, stiffness: 280 }}
    >
      <div className="p-6 flex flex-col justify-between h-[150px] border-b border-[#262626]">
        <h1 className="text-3xl font-bold">Search</h1>
        <Search />
      </div>
      <div className="h-full p-6">
        <h3 className="text-lg font-semibold">Recent</h3>
        <div className="flex items-center justify-center py-10">
          <p className="text-neutral-400 font-medium">No recent searches.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default SideSearch;
