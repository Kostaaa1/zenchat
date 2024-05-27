import useSearchStore from "../utils/state/searchStore";
import useUser from "./useUser";
import useGeneralStore, { ActiveList } from "../utils/state/generalStore";
import { useNavigate } from "react-router-dom";
import useModalStore from "../utils/state/modalStore";
import { RefObject, useCallback, useEffect } from "react";
import useWindowSize from "./useWindowSize";
import type { icons } from "lucide-react";

export type NavListItems = {
  iconName?: keyof typeof icons;
  iconStrokeWidth?: string;
  title?: string;
  onClick?: () => void;
  ref?: RefObject<HTMLDivElement>;
  className?: string;
};

const useNavbar = () => {
  const navigate = useNavigate();
  const isSearchActive = useSearchStore((state) => state.isSearchActive);
  const { userData } = useUser();
  const isResponsive = useGeneralStore((state) => state.isResponsive);
  const { openModal } = useModalStore((state) => state.actions);
  const { width } = useWindowSize();
  const activeNavList = useGeneralStore((state) => state.activeNavList);
  const { setIsSearchActive } = useSearchStore((state) => state.actions);
  const isMobile = useGeneralStore((state) => state.isMobile);
  const searchInputRef = useSearchStore((state) => state.searchInputRef);
  const { setActiveNavList, setIsResponsive } = useGeneralStore(
    (state) => state.actions,
  );

  const handleActivateSearch = useCallback(() => {
    if (isMobile && location.pathname !== "/") {
      navigate(`/${userData!.username}`);
    }
    setIsSearchActive(!isSearchActive);
  }, [setIsSearchActive, isSearchActive]);

  const handleActiveElement = useCallback((list: ActiveList) => {
    if (width > 1024) setIsResponsive(list === "inbox");
    setActiveNavList(list);
    if (list === "user") {
      navigate(`/${userData?.username}`);
    } else if (list === "inbox") {
      navigate(`/inbox`);
    }
  }, []);

  // const activeListClass = "bg-neutral-900 ring ring-[1.4px] ring-neutral-700";
  const activeListClass = "bg-neutral-900";
  const navListItems: NavListItems[] = [
    {
      iconName: "MessageCircle",
      iconStrokeWidth: activeNavList === "inbox" ? "2" : "",
      title: isResponsive ? "" : "Messages",
      onClick: () => {
        handleActiveElement("inbox");
        setIsSearchActive(false);
      },
      className: `${
        location.pathname.includes("/inbox") || activeNavList === "inbox"
          ? activeListClass
          : null
      }`,
    },
    {
      iconName: "Search",
      iconStrokeWidth: isSearchActive ? "2" : "",
      title: isResponsive ? "" : "Search",
      className: `${isSearchActive ? activeListClass : null} `,
      onClick: handleActivateSearch,
      ref: searchInputRef,
    },
    {
      iconName: "PlusSquare",
      title: isResponsive ? "" : "Create",
      onClick: () => openModal("uploadpost"),
    },
    {
      title: isResponsive ? "" : "Profile",
      onClick: () => {
        handleActiveElement("user");
        setIsSearchActive(false);
      },
      className: `${
        location.pathname === `/${userData?.username}` ? activeListClass : null
      }`,
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
