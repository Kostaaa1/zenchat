import React, { FC } from "react";
import { useAuth } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { trpc } from "../../utils/trpcClient";
import { useNavigate } from "react-router-dom";

type UserDropdownProps = {
  dropdownRef: React.RefObject<HTMLDivElement>;
};

type LiProps = {
  text: string;
  onClick: () => void;
};

const Li: FC<LiProps> = ({ onClick, text }) => {
  return (
    <li
      onClick={onClick}
      className="h-full w-full cursor-pointer rounded-lg p-2 transition-colors duration-100 hover:bg-zinc-400 hover:bg-opacity-30"
    >
      {text}
    </li>
  );
};

const UserDropdown: FC<UserDropdownProps> = ({ dropdownRef }) => {
  const { signOut } = useAuth();
  const ctx = trpc.useUtils();
  const navigate = useNavigate();

  const handleLogOut = async () => {
    navigate("/");
    ctx.invalidate();
    signOut();
  };

  return (
    <>
      <motion.div
        ref={dropdownRef}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 10, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="right-15 absolute bottom-14 w-[200px] rounded-lg bg-neutral-800 p-2"
      >
        <ul>
          <Li text="Log out" onClick={handleLogOut} />
        </ul>
      </motion.div>
    </>
  );
};

export default UserDropdown;
