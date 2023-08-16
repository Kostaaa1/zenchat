import { useUser } from "@clerk/clerk-react";
import React, { FC, useEffect, useRef } from "react";
import Icon from "./Icon";
import ListItem from "./ListItem";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "./Logo";
import useStore, { ActiveList } from "../../../store";
import UserDropdown from "./UserDropdown";

interface NavbarProps {
  handleActivateSearch: () => void;
  handleActiveElement: (list: ActiveList) => void;
  iconRef: React.RefObject<HTMLDivElement>;
  dropdownRef: React.RefObject<HTMLDivElement>;
}

const Navbar: FC<NavbarProps> = ({
  handleActiveElement,
  handleActivateSearch,
  iconRef,
  dropdownRef,
}) => {
  const { user } = useUser();
  const { setShowDropdown, showDropdown, currentActiveList, isSearchActive } =
    useStore();

  return (
    <nav>
      <AnimatePresence>
        {isSearchActive || currentActiveList !== "home" ? (
          <motion.ul
            initial={{ width: "288px" }}
            animate={{ width: "80px" }}
            exit={{ width: "288px" }}
            className="absolute flex flex-col justify-between px-4 bg-[#000000] select-none left-0 top-0 z-[100] h-full py-6 border-r border-[#262626]"
          >
            <Logo variant="default" />
            <div className="my-5 py-5 h-full w-full">
              <ListItem
                variant="default"
                className="mb-4"
                onClick={() => handleActiveElement("inbox")}
              >
                <Icon name="MessageCircle" color="white" size="28px" />
              </ListItem>
              <ListItem
                variant="default"
                className={`${isSearchActive && "ring-1 ring-white"} mb-4`}
                onClick={handleActivateSearch}
              >
                <Icon name="Search" color="white" size="28px" />
              </ListItem>
              <ListItem
                variant="default"
                className="mb-4"
                onClick={() => handleActiveElement("home")}
              >
                <img src={user?.imageUrl} className="w-7 h-7 rounded-full" />
              </ListItem>
            </div>
            <div ref={iconRef} onClick={() => setShowDropdown(!showDropdown)}>
              <ListItem variant="default">
                <Icon name="Menu" color="white" size="28px" />
              </ListItem>
            </div>
          </motion.ul>
        ) : (
          <motion.ul
            initial={{ width: "80px" }}
            animate={{ width: "288px" }}
            exit={{ width: "80px" }}
            className="absolute px-4 w-[288px] bg-[#000000] select-none left-0 top-0 z-[100] flex justify-between flex-col h-full py-6 border-r border-[#262626]"
          >
            <Logo variant="list" />
            <div className="my-5 py-5 h-full w-full flex flex-col">
              <ListItem
                className="mb-4"
                title="Messages"
                onClick={() => handleActiveElement("inbox")}
              >
                <Icon name="MessageCircle" color="white" size="28px" />
              </ListItem>
              <ListItem
                title="Search"
                className={`${isSearchActive && "ring-1 ring-white"} mb-4`}
                onClick={handleActivateSearch}
              >
                <Icon name="Search" color="white" size="28px" />
              </ListItem>
              <ListItem
                title="Profile"
                className="mb-4"
                onClick={() => handleActiveElement("home")}
              >
                <img src={user?.imageUrl} className="w-7 h-7 rounded-full" />
              </ListItem>
            </div>
            <div>
              <ListItem title="Menu">
                <Icon name="Menu" color="white" size="28px" />
              </ListItem>
            </div>
          </motion.ul>
        )}
      </AnimatePresence>
      {showDropdown && <UserDropdown dropdownRef={dropdownRef} />}
    </nav>
  );
};

export default Navbar;
