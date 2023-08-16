import React, { FC, useEffect, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import useStore from "../../../store";

interface UserDropdownProps {
  dropdownRef: React.RefObject<HTMLDivElement>;
}

const UserDropdown: FC<UserDropdownProps> = ({ dropdownRef }) => {
  const { signOut } = useAuth();

  return (
    <div ref={dropdownRef}>
      <motion.div
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
        <ul className="flex flex-col absolute z-[100] rounded-lg w-[200px] left-4 bg-neutral-800 p-2">
          <li
            onClick={() => signOut()}
            className="h-full w-full hover:bg-zinc-400 hover:bg-opacity-30 p-2 rounded-lg cursor-pointer"
          >
            Log out
          </li>
        </ul>
      </motion.div>
    </div>
  );
};

export default UserDropdown;
