import React, { FC } from "react";
import { useAuth } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { trpc } from "../../../utils/trpcClient";
import { useNavigate } from "react-router-dom";

interface UserDropdownProps {
  dropdownRef: React.RefObject<HTMLDivElement>;
}

const UserDropdown: FC<UserDropdownProps> = ({ dropdownRef }) => {
  const { signOut } = useAuth();
  const ctx = trpc.useContext();
  const navigate = useNavigate();

  const handleLogOut = async () => {
    navigate("/");
    ctx.invalidate();
    signOut();
  };

  return (
    <div ref={dropdownRef}>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        style={{
          position: "absolute",
          bottom: "120px",
          zIndex: 10000,
        }}
      >
        <ul className="absolute left-0 z-[100] flex w-[200px] flex-col rounded-lg bg-neutral-800 p-2">
          <li
            onClick={handleLogOut}
            className="h-full w-full cursor-pointer rounded-lg p-2 transition-colors duration-100 hover:bg-zinc-400 hover:bg-opacity-30"
          >
            Log out
          </li>
        </ul>
      </motion.div>
    </div>
  );
};

export default UserDropdown;
