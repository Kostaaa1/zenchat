import useSearchStore from "../lib/stores/searchStore";
import useUser from "./useUser";
import useGeneralStore, { ActiveList } from "../lib/stores/generalStore";
import { useLocation, useNavigate } from "react-router-dom";
import useModalStore from "../lib/stores/modalStore";
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
  const location = useLocation();
  const activeNavList = useGeneralStore((state) => state.activeNavList);
  const { setIsSearchActive } = useSearchStore((state) => state.actions);
  const isMobile = useGeneralStore((state) => state.isMobile);
  const searchInputRef = useSearchStore((state) => state.searchInputRef);
  const { setActiveNavList, setIsResponsive } = useGeneralStore(
    (state) => state.actions,
  );

  useEffect(() => {
    setIsResponsive(location.pathname.includes("inbox") || width <= 1024);
  }, [width]);

  const handleActiveElement = useCallback(
    (list: ActiveList | null) => {
      if (list) {
        setIsResponsive(list === "inbox");
        setActiveNavList(list);
        setIsSearchActive(false);

        if (list === "user") {
          navigate(`/${userData?.username}`);
        } else if (list === "inbox") {
          navigate(`/inbox`);
        }
      } else {
        console.log("Ran else");
        setIsSearchActive(!isSearchActive);
        // setIsResponsive(
        //   !location.pathname.includes("inbox") || !isSearchActive,
        // );
        setIsResponsive(
          location.pathname.includes("inbox") ||
            (!location.pathname.includes("inbox") && !isSearchActive),
        );

        if (isMobile && location.pathname !== "/") {
          navigate(`/${userData!.username}`);
        }
      }
    },
    [isSearchActive, location.pathname, isMobile],
  );

  // const activeListClass = "bg-neutral-900 ring ring-[1.4px] ring-neutral-700";
  const activeListClass = "bg-neutral-900";
  const navListItems: NavListItems[] = [
    {
      iconName: "MessageCircle",
      iconStrokeWidth: activeNavList === "inbox" ? "2" : "",
      title: isResponsive ? "" : "Messages",
      onClick: () => {
        handleActiveElement("inbox");
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
      onClick: () => handleActiveElement(null),
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
      },
      className: `${
        location.pathname === `/${userData?.username}` ? activeListClass : null
      }`,
    },
  ];

  return {
    navListItems,
    handleActiveElement,
    // handleClick,
  };
};

export default useNavbar;
