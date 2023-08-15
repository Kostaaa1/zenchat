import { FC, useEffect, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import useStore from "../../../store";

interface UserDropdownProps {}

const UserDropdown: FC<UserDropdownProps> = () => {
  const { signOut } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={dropdownRef}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      style={{
        position: "absolute",
        bottom: "150px",
        zIndex: 10000,
      }}
    >
      <ul className="flex left-2 flex-col absolute z-[100] rounded-lg w-[220px] bg-neutral-800 p-2">
        <li
          onClick={() => signOut()}
          className="h-full w-full hover:bg-zinc-400 hover:bg-opacity-30 p-2 py-3 rounded-lg cursor-pointer"
        >
          Log out
        </li>
      </ul>
    </motion.div>
  );
};

export default UserDropdown;
