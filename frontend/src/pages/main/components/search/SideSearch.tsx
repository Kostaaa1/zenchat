import { motion } from "framer-motion";
import Search from "./Search";

const SideSearch = () => {
  return (
    <motion.div
      className="fixed overflow-hidden z-10 top-0 left-[78px] h-full w-[420px] border-r border-[#262626] bg-[#000000]"
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
        <div className="flex items-center justify-center py-10">
          <p className="text-neutral-400 font-medium">No recent searches.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default SideSearch;
