import useSearchStore from "../utils/state/searchStore";
import useUser from "./useUser";
import useGeneralStore, { ActiveList } from "../utils/state/generalStore";
import { useNavigate, useParams } from "react-router-dom";
import useModalStore from "../utils/state/modalStore";
import { useEffect } from "react";
import useWindowSize from "./useWindowSize";
import type { icons } from "lucide-react";

export type NavListItems = {
  iconName?: keyof typeof icons;
  iconStrokeWidth?: string;
  title?: string;
  onClick?: () => void;
  className?: string;
};

const useNavbar = () => {
  const navigate = useNavigate();
  const isSearchActive = useSearchStore((state) => state.isSearchActive);
  const { userData } = useUser();
  const isResponsive = useGeneralStore((state) => state.isResponsive);
  const { setIsDndUploadModalOpen } = useModalStore((state) => state.actions);
  const { width } = useWindowSize();
  const activeNavList = useGeneralStore((state) => state.activeNavList);
  const { setActiveNavList, setIsResponsive } = useGeneralStore(
    (state) => state.actions,
  );
  const { setIsSearchActive } = useSearchStore((state) => state.actions);

  useEffect(() => {
    const { pathname } = location;
    if (width <= 1024) return;
    setIsResponsive(isSearchActive || pathname.includes("/inbox"));
  }, [isSearchActive, width, location.pathname]);

  const handleActivateSearch = () => {
    setIsSearchActive(!isSearchActive);
  };

  const handleActiveElement = (list: ActiveList) => {
    if (width > 1024) setIsResponsive(list === "inbox");
    setActiveNavList(list);
    if (list === "user") {
      navigate(`/${userData?.username}`);
    } else if (list === "inbox") {
      navigate(`/inbox`);
    }
  };

  // const activeListClass = "bg-neutral-900 ring ring-[1.4px] ring-neutral-700";
  const activeListClass = "bg-neutral-900";
  const navListItems: NavListItems[] = [
    {
      iconName: "MessageCircle",
      iconStrokeWidth: activeNavList === "inbox" ? "2" : "",
      title: isResponsive ? "" : "Messages",
      onClick: () => handleActiveElement("inbox"),
      className: `${activeNavList === "inbox" ? activeListClass : null} `,
    },
    {
      iconName: "Search",
      iconStrokeWidth: isSearchActive ? "2" : "",
      title: isResponsive ? "" : "Search",
      className: `${isSearchActive ? activeListClass : null} `,
      onClick: handleActivateSearch,
    },
    {
      iconName: "PlusSquare",
      title: isResponsive ? "" : "Create",
      onClick: () => setIsDndUploadModalOpen(true),
    },
    {
      title: isResponsive ? "" : "Profile",
      onClick: () => handleActiveElement("user"),
      className: `${activeNavList === "user" ? activeListClass : null} `,
    },
  ];

  return {
    navListItems,
    handleActiveElement,
    handleActivateSearch,
    // handleClick,
  };
};

export default useNavbar;
