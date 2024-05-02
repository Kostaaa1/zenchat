import React, { FC, useEffect, useState } from "react";
import Icon from "./Icon";
import NavList from "./NavList";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "./Logo";
import UserDropdown from "./UserDropdown";
import { useLocation } from "react-router-dom";
import { cn } from "../../../utils/utils";
import Avatar from "../../../components/avatar/Avatar";
import useUser from "../../../hooks/useUser";
import useGeneralStore, {
  ActiveList,
} from "../../../utils/stores/generalStore";
import useWindowSize from "../../../hooks/useWindowSize";
import { icons } from "lucide-react";
import useModalStore from "../../../utils/stores/modalStore";

type NavListItems = {
  iconName?: keyof typeof icons;
  iconStrokeWidth?: string;
  title?: string;
  onClick?: () => void;
  className?: string;
};

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
  const isMobile = useGeneralStore((state) => state.isMobile);
  const currentActiveNavList = useGeneralStore(
    (state) => state.currentActiveNavList,
  );
  const showDropdown = useGeneralStore((state) => state.showDropdown);
  const isSearchActive = useGeneralStore((state) => state.isSearchActive);
  const { setIsDndUploadModalOpen } = useModalStore((state) => state.actions);
  const isResponsive = useGeneralStore((state) => state.isResponsive);
  const location = useLocation();
  const [list, setList] = useState<"list" | "default">("default");
  const { userData } = useUser();
  const { width } = useWindowSize();
  const { setShowDropdown, setIsResponsive } = useGeneralStore(
    (state) => state.actions,
  );

  useEffect(() => {
    console.log("isMobile", isMobile);
  }, [isMobile]);

  useEffect(() => {
    if (width <= 1024) return;
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

  const NavListItems: NavListItems[] = [
    {
      iconName: "MessageCircle",
      iconStrokeWidth: currentActiveNavList === "inbox" ? "2" : "",
      title: isResponsive ? "" : "Messages",
      onClick: () => handleClick("inbox"),
    },
    {
      iconName: "Search",
      iconStrokeWidth: isSearchActive ? "2" : "",
      title: isResponsive ? "" : "Search",
      onClick: handleActivateSearch,
      className: `${isSearchActive ? "outline outline-1" : null} `,
    },
    {
      iconName: "PlusSquare",
      title: isResponsive ? "" : "Create",
      onClick: () => setIsDndUploadModalOpen(true),
    },
    {
      title: isResponsive ? "" : "Profile",
      onClick: () => handleClick("user"),
    },
  ];

  return (
    <motion.nav>
      <AnimatePresence>
        <motion.ul
          initial={{ width: isResponsive ? "300px" : "80px" }}
          animate={{ width: isResponsive ? "80px" : "300px" }}
          exit={{ width: isResponsive ? "300px" : "80px" }}
          transition={{ type: "spring", damping: 45, stiffness: 300 }}
          className="fixed left-0 top-0 z-50 flex h-full select-none flex-col justify-between border-r border-[#262626] bg-black p-4 py-6"
        >
          <Logo variant={isResponsive ? "default" : "list"} />
          <div
            className={cn(
              "my-4 h-full w-full space-y-2 py-4",
              !isResponsive && "flex flex-col",
            )}
          >
            {NavListItems.map((li, id) => (
              <div key={id}>
                {id !== NavListItems.length - 1 && li.iconName ? (
                  <NavList
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
                  </NavList>
                ) : (
                  <NavList
                    variant={list}
                    title={li.title}
                    className="mb-2"
                    onClick={() => handleClick("user")}
                  >
                    <div>
                      <Avatar image_url={userData?.image_url} size="sm" />
                    </div>
                  </NavList>
                )}
              </div>
            ))}
          </div>
          <div
            className="relative"
            ref={iconRef}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <NavList variant={list} title={isResponsive ? "" : "Menu"}>
              <Icon name="Menu" color="white" size="28px" />
            </NavList>
            <AnimatePresence>
              {showDropdown && <UserDropdown dropdownRef={dropdownRef} />}
            </AnimatePresence>
          </div>
        </motion.ul>
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
