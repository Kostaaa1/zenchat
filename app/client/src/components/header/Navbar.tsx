import { useEffect, useRef, useState } from "react";
import Icon from "../Icon";
import NavList from "../NavList";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "../Logo";
import { cn } from "../../utils/utils";
import Avatar from "../avatar/Avatar";
import useUser from "../../hooks/useUser";
import useGeneralStore from "../../utils/state/generalStore";
import BottomNavbar from "./BottomNav";
import useOutsideClick from "../../hooks/useOutsideClick";
import NavHamburger from "./NavHamburger";
import useNavbar from "../../hooks/useNavbar";

const Navbar = () => {
  const isMobile = useGeneralStore((state) => state.isMobile);
  const isResponsive = useGeneralStore((state) => state.isResponsive);
  const { setShowDropdown } = useGeneralStore((state) => state.actions);
  const { userData } = useUser();
  const iconRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { navListItems } = useNavbar();
  const [list, setList] = useState<"list" | "default">("default");
  useOutsideClick([iconRef, dropdownRef], "click", () =>
    setShowDropdown(false),
  );

  useEffect(() => {
    setList(isResponsive ? "default" : "list");
  }, [isResponsive]);

  return (
    <motion.nav>
      <AnimatePresence>
        {isMobile ? (
          <BottomNavbar />
        ) : (
          <motion.ul
            initial={{ width: isResponsive ? "300px" : "80px" }}
            animate={{ width: isResponsive ? "80px" : "300px" }}
            exit={{ width: isResponsive ? "300px" : "80px" }}
            // transition={{ type: "spring", damping: 45, stiffness: 300 }}
            className={cn(
              "fixed left-0 top-0 z-50 flex h-full select-none flex-col justify-between border-r border-[#262626] bg-black p-4 py-6",
            )}
          >
            <Logo />
            <div
              className={cn(
                "my-4 h-full w-full space-y-2 py-4",
                !isResponsive && "flex flex-col",
              )}
            >
              {navListItems.map((li, id) => (
                <div key={id}>
                  <NavList
                    variant={list}
                    onClick={li.onClick}
                    title={li.title}
                    className={li.className}
                  >
                    {li.iconName ? (
                      <Icon
                        strokeWidth={li.iconStrokeWidth}
                        name={li.iconName}
                        color="white"
                        size="28px"
                      />
                    ) : (
                      <Avatar image_url={userData?.image_url} size="sm" />
                    )}
                  </NavList>
                </div>
              ))}
            </div>
            <NavHamburger dropdownRef={dropdownRef} iconRef={iconRef} />
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
