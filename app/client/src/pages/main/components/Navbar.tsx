import React, { FC, useEffect, useState } from "react";
import Icon from "./Icon";
import ListItem from "./ListItem";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "./Logo";
import useStore, { ActiveList } from "../../../utils/stores/store";
import UserDropdown from "./UserDropdown";
import { useLocation } from "react-router-dom";
import { cn } from "../../../utils/utils";
import Avatar from "../../../components/Avatar";

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
  const { setShowDropdown, showDropdown, isSearchActive } = useStore();
  const location = useLocation();
  const [isResponsive, setIsResponsive] = useState<boolean>(false);
  const [list, setList] = useState<"list" | "default">("default");

  useEffect(() => {
    if (isSearchActive || location.pathname.split("/inbox").length > 1) {
      setIsResponsive(true);
    } else {
      setIsResponsive(false);
    }
  }, [isSearchActive, location]);

  useEffect(() => {
    setList(isResponsive ? "default" : "list");
  }, [isResponsive]);

  const handleClick = (title: ActiveList) => {
    handleActiveElement(title);
    if (title === "inbox") return;
    setIsResponsive(isSearchActive);
  };

  return (
    <nav className="">
      <AnimatePresence>
        <motion.ul
          initial={{ width: isResponsive ? "320px" : "80px" }}
          animate={{ width: isResponsive ? "80px" : "320px" }}
          exit={{ width: isResponsive ? "320px" : "80px" }}
          transition={{ type: "spring", damping: 45, stiffness: 320 }}
          className="fixed left-0 top-0 z-50 flex h-full select-none flex-col justify-between border-r border-[#262626] bg-[#000000] px-4 py-6"
        >
          <Logo variant={isResponsive ? "default" : "list"} />
          <div
            className={cn(
              isResponsive
                ? "my-4 h-full w-full py-4"
                : "my-4 flex h-full w-full flex-col py-4",
            )}
          >
            <ListItem
              variant={list}
              className="mb-2"
              title={isResponsive ? "" : "Messages"}
              onClick={() => handleClick("inbox")}
            >
              <Icon name="MessageCircle" color="white" size="28px" />
            </ListItem>
            <ListItem
              variant={list}
              title={isResponsive ? "" : "Search"}
              className={`${isSearchActive ? "outline outline-1" : null} mb-2`}
              onClick={handleActivateSearch}
            >
              <Icon name="Search" color="white" size="28px" />
            </ListItem>
            <ListItem
              variant={list}
              className="mb-2"
              title={isResponsive ? "" : "Profile"}
              onClick={() => handleClick("user")}
            >
              <div className="">
                <Avatar size="sm" />
              </div>
            </ListItem>
          </div>
          <div
            className="relative"
            ref={iconRef}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <ListItem variant={list} title={isResponsive ? "" : "Menu"}>
              <Icon name="Menu" color="white" size="28px" />
            </ListItem>
            <AnimatePresence>
              {showDropdown && <UserDropdown dropdownRef={dropdownRef} />}
            </AnimatePresence>
          </div>
        </motion.ul>
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
