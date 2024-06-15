import Navbar from "./Navbar";
import Search from "../search/Search";
import { AnimatePresence } from "framer-motion";
import useGeneralStore from "../../stores/generalStore";
import useSearchStore from "../../stores/searchStore";
import { useLocation } from "react-router-dom";
import useNavbar from "../../hooks/useNavbar";
import useOutsideClick from "../../hooks/useOutsideClick";
import { memo } from "react";
import { TopNav } from "./TopNav";

const Header = memo(() => {
  const isMobile = useGeneralStore((state) => state.isMobile);
  const isSearchActive = useSearchStore((state) => state.isSearchActive);
  const location = useLocation();
  const { navListItems } = useNavbar();
  const { setIsSearchActive } = useSearchStore((state) => state.actions);
  const searchRefInput = useSearchStore((state) => state.searchInputRef);
  const searchRef = useSearchStore((state) => state.searchRef);
  useOutsideClick([searchRefInput, searchRef], "mousedown", () => {
    setIsSearchActive(false);
  });

  return (
    <div ref={searchRef}>
      {isMobile && !location.pathname.includes("/inbox") && <TopNav />}
      <Navbar navListItems={navListItems} />
      {!isMobile && (
        <AnimatePresence>{isSearchActive ? <Search /> : null}</AnimatePresence>
      )}
    </div>
  );
});

export default Header;
