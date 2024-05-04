import NavList from "../NavList";
import useUser from "../../hooks/useUser";
import Icon from "../Icon";
import Avatar from "../avatar/Avatar";
import useNavbar from "../../hooks/useNavbar";

const BottomNavbar = () => {
  const { userData } = useUser();
  const { navListItems } = useNavbar();
  return (
    <ul className="fixed bottom-0 z-50 flex h-14 w-full select-none items-center justify-evenly border-t border-[#262626] bg-black">
      {navListItems.map((li, id) => (
        <div key={id}>
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
        </div>
      ))}
    </ul>
  );
};

export default BottomNavbar;
