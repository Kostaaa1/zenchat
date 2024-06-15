import NavList from "../NavList";
import useUser from "../../hooks/useUser";
import Icon from "../Icon";
import Avatar from "../avatar/Avatar";
import { NavListItems } from "../../hooks/useNavbar";
import { FC } from "react";
import useChatStore from "../../stores/chatStore";

type BottomNavbarProps = {
  navListItems: NavListItems[];
};

const BottomNavbar: FC<BottomNavbarProps> = ({ navListItems }) => {
  const { userData } = useUser();
  const unreadMessagesCount = useChatStore(
    (state) => state.unreadMessagesCount,
  );

  return (
    <ul
      id="bottomnav"
      className="fixed bottom-0 z-50 flex h-14 w-full select-none items-center justify-evenly border-t border-[#262626] bg-black"
    >
      {navListItems.map((li, id) => (
        <div key={id} ref={li.ref} className="relative">
          <NavList
            variant="default"
            onClick={li.onClick}
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
          {li.iconName === "MessageCircle" && unreadMessagesCount > 0 && (
            <span className="absolute left-[2px] top-[2px] flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-base">
              {unreadMessagesCount}
            </span>
          )}
        </div>
      ))}
    </ul>
  );
};

export default BottomNavbar;
