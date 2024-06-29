import NavList from "../NavList"
import Icon from "../Icon"
import Avatar from "../avatar/Avatar"
import { NavListItems } from "../../hooks/useNavbar"
import { FC } from "react"
import useUser from "../../hooks/useUser"

type BottomNavbarProps = {
  navListItems: NavListItems[]
}

const BottomNavbar: FC<BottomNavbarProps> = ({ navListItems }) => {
  const { user, unreadChatIds } = useUser()
  return (
    <ul
      id="bottomnav"
      className="fixed bottom-0 z-50 flex h-14 w-full select-none items-center justify-evenly border-t border-[#262626] bg-black"
    >
      {navListItems.map((li, id) => (
        <div key={id} ref={li.ref} className="relative">
          <NavList variant="default" onClick={li.onClick} title={li.title} className={li.className}>
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
    </ul>
  )
}

export default BottomNavbar
