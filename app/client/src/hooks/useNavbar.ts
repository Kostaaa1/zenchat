import useSearchStore from "../utils/state/searchStore";
import useUser from "./useUser";
import useGeneralStore, { ActiveList } from "../utils/state/generalStore";
import { useNavigate } from "react-router-dom";
import useModalStore from "../utils/state/modalStore";
import { useEffect } from "react";
import useWindowSize from "./useWindowSize";
import type { icons } from "lucide-react";

type NavListItems = {
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
  const { setIsSearchActive, setIsSearchFocused } = useSearchStore(
    (state) => state.actions,
  );

  useEffect(() => {
    if (width <= 1024) return;
    setIsResponsive(isSearchActive || location.pathname.includes("/inbox"));
  }, [isSearchActive, width, location]);

  const handleActivateSearch = () => {
    setIsSearchFocused(true);
    setIsSearchActive(!isSearchActive);
  };

  const handleActiveElement = (list: ActiveList) => {
    if (width > 1024) {
      setIsResponsive(list === "inbox");
    }
    setIsSearchActive(false);
    setActiveNavList(list);
    if (list === "user") {
      navigate(`/${userData?.username}`);
    } else if (list === "inbox") {
      navigate(`/inbox`);
    }
  };

  useEffect(() => {
    console.log('activeNavList', activeNavList)
  }, [activeNavList])

  const navListItems: NavListItems[] = [
    {
      iconName: "MessageCircle",
      iconStrokeWidth: activeNavList === "inbox" ? "2" : "",
      title: isResponsive ? "" : "Messages",
      onClick: () => handleActiveElement("inbox"),
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
      onClick: () => handleActiveElement("user"),
    },
  ];

  return {
    navListItems,
    // handleClick,
    handleActiveElement,
    handleActivateSearch,
  };
};

export default useNavbar;
