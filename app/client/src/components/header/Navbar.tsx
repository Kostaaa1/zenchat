import { FC, useEffect, useState } from "react";
import Icon from "../Icon";
import NavList from "../NavList";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "../Logo";
import { cn } from "../../utils/utils";
import Avatar from "../avatar/Avatar";
import useUser from "../../hooks/useUser";
import useGeneralStore from "../../utils/state/generalStore";
import BottomNavbar from "./BottomNav";
import NavHamburger from "./NavHamburger";
import { NavListItems } from "../../hooks/useNavbar";

type NavbarProps = {
  navListItems: NavListItems[];
};

const Navbar: FC<NavbarProps> = ({ navListItems }) => {
  const isMobile = useGeneralStore((state) => state.isMobile);
  const isResponsive = useGeneralStore((state) => state.isResponsive);
  const { userData } = useUser();
  const [list, setList] = useState<"list" | "default">("default");
  useEffect(() => {
    setList(isResponsive ? "default" : "list");
  }, [isResponsive]);

  return (
    <motion.nav>
      <AnimatePresence>
        {isMobile ? (
          <BottomNavbar navListItems={navListItems} />
        ) : (
          <ul
            className={cn(
              "fixed left-0 top-0 z-50 flex h-full select-none flex-col justify-between border-r border-[#262626] bg-black p-4 py-6 transition-all duration-300",
              isResponsive ? "w-[80px]" : "w-[300px]",
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
                <div key={id} ref={li.ref}>
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
            <NavHamburger />
          </ul>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
