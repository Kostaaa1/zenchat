import React, { FC, useEffect, useState } from "react";
import Icon from "./Icon";
import ListItem from "./ListItem";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "./Logo";
import useStore, { ActiveList } from "../../../utils/stores/store";
import UserDropdown from "./UserDropdown";
import { useLocation } from "react-router-dom";
import { cn } from "../../../utils/utils";
import Avatar from "../../../components/avatar/Avatar";

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
  const {
    currentActiveNavList,
    setShowDropdown,
    showDropdown,
    isSearchActive,
  } = useStore();
  const location = useLocation();
  const [isResponsive, setIsResponsive] = useState<boolean>(false);
  const [list, setList] = useState<"list" | "default">("default");

  useEffect(() => {
    setIsResponsive(isSearchActive || location.pathname.includes("/inbox"));
  }, [isSearchActive, location]);

  useEffect(() => {
    setList(isResponsive ? "default" : "list");
  }, [isResponsive]);

  const handleClick = (title: ActiveList) => {
    handleActiveElement(title);
    if (title === "inbox") return;
    setIsResponsive(isSearchActive);
  };

  type ListItems = {
    iconName?: "MessageCircle" | "Search" | undefined;
    iconStrokeWidth?: string;
    title?: string;
    onClick?: () => void;
    className?: string;
  };

  const listItems: ListItems[] = [
    {
      iconName: "MessageCircle",
      iconStrokeWidth: currentActiveNavList === "inbox" ? "3" : "",
      title: isResponsive ? "" : "Messages",
      onClick: () => handleClick("inbox"),
      className: "mb-2",
    },
    {
      iconName: "Search",
      iconStrokeWidth: isSearchActive ? "3" : "",
      title: isResponsive ? "" : "Search",
      onClick: handleActivateSearch,
      className: `${isSearchActive ? "outline outline-1" : null} mb-2`,
    },
    {
      title: isResponsive ? "" : "Profile",
      className: "mb-2",
      onClick: () => handleClick("user"),
    },
  ];

  return (
    <nav>
      <AnimatePresence>
        <motion.ul
          initial={{ width: isResponsive ? "320px" : "80px" }}
          animate={{ width: isResponsive ? "80px" : "320px" }}
          exit={{ width: isResponsive ? "320px" : "80px" }}
          transition={{ type: "spring", damping: 45, stiffness: 320 }}
          className="sm:w-[80px fixed left-0 top-0 z-50 flex h-full select-none flex-col justify-between border-r border-[#262626] bg-black px-4 py-6"
        >
          <Logo variant={isResponsive ? "default" : "list"} />
          <div
            className={cn(
              "my-4 h-full w-full py-4",
              !isResponsive && "flex flex-col",
            )}
          >
            {listItems.map((li, id) => (
              <div key={id}>
                {id !== listItems.length - 1 && li.iconName ? (
                  <ListItem
                    variant={list}
                    onClick={li.onClick}
                    title={li.title}
                    className={li.className}
                  >
                    <Icon
                      strokeWidth={li.iconStrokeWidth}
                      name={li.iconName}
                      color="white"
                      size="28px"
                    />
                  </ListItem>
                ) : (
                  <ListItem
                    variant={list}
                    title={li.title}
                    className="mb-2"
                    onClick={() => handleClick("user")}
                  >
                    <div>
                      <Avatar size="sm" />
                    </div>
                  </ListItem>
                )}
              </div>
            ))}
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
