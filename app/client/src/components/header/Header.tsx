import Navbar from "./Navbar";
import Search from "../search/Search";
import { AnimatePresence } from "framer-motion";
import useGeneralStore from "../../utils/state/generalStore";
import Logo from "../Logo";
import SearchInput from "../search/SearchInput";
import useSearchStore from "../../utils/state/searchStore";
import { useLocation } from "react-router-dom";
import useNavbar from "../../hooks/useNavbar";
import useOutsideClick from "../../hooks/useOutsideClick";

const TopNav = () => {
  const isSearchActive = useSearchStore((state) => state.isSearchActive);
  return (
    <div className="flex items-center justify-between border-b border-[#232323] bg-black py-2 pr-4">
      <Logo />
      <SearchInput />
      {isSearchActive ? <Search /> : null}
    </div>
  );
};

const Header = () => {
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
};

export default Header;
