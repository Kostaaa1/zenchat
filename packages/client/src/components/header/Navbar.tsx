import { FC, useEffect, useState } from "react"
import Icon from "../Icon"
import NavList from "../NavList"
import { AnimatePresence } from "framer-motion"
import Logo from "../Logo"
import { cn } from "../../utils/utils"
import Avatar from "../avatar/Avatar"
import useUser from "../../hooks/useUser"
import useGeneralStore from "../../stores/generalStore"
import BottomNavbar from "./BottomNav"
import NavHamburger from "./NavHamburger"
import { NavListItems } from "../../hooks/useNavbar"

type NavbarProps = {
  navListItems: NavListItems[]
}

const Navbar: FC<NavbarProps> = ({ navListItems }) => {
  const isMobile = useGeneralStore((state) => state.isMobile)
  const isResponsive = useGeneralStore((state) => state.isResponsive)
  const [list, setList] = useState<"list" | "default">("default")
  const { user, unreadChatIds } = useUser()

  useEffect(() => {
    setList(isResponsive ? "default" : "list")
  }, [isResponsive])

  return (
    <nav>
      <AnimatePresence>
        {isMobile ? (
          <BottomNavbar navListItems={navListItems} />
        ) : (
          <ul
            className={cn(
              "fixed left-0 top-0 z-50 flex h-full select-none flex-col justify-between border-r border-[#262626] bg-black p-4 py-6 transition-all duration-300",
              !isResponsive ? "w-[300px]" : "w-[80px]"
            )}
          >
            <Logo />
            <div className={cn("my-4 h-full w-full space-y-2 py-4", !isResponsive && "flex flex-col")}>
              {navListItems.map((li, id) => (
                <div key={id} ref={li.ref} className="relative">
                  <NavList variant={list} onClick={li.onClick} title={li.title} className={li.className}>
                    {li.iconName ? (
                      <Icon
                        strokeWidth={li.iconStrokeWidth}
                        name={li.iconName}
                        color="white"
                        size="28px"
                        fill={li.iconName === "MessageCircle" && unreadChatIds.length > 0 ? "white" : ""}
                      />
                    ) : (
                      <Avatar image_url={user?.image_url} size="sm" />
                    )}
                  </NavList>
                  {li.iconName === "MessageCircle" && unreadChatIds.length > 0 && (
                    <span className="absolute right-[2px] top-[6px] flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-sm">
                      {unreadChatIds.length}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <NavHamburger />
          </ul>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
