import Navbar from "./components/Navbar";
import SideSearch from "./components/search/SideSearch";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import useGeneralStore, { ActiveList } from "../../utils/stores/generalStore";
import { useRef } from "react";
import useOutsideClick from "../../hooks/useOutsideClick";
import useUser from "../../hooks/useUser";

const Header = () => {
  const isSearchActive = useGeneralStore((state) => state.isSearchActive);
  const { setIsSearchActive, setShowDropdown, setCurrentActiveNavList } =
    useGeneralStore((state) => state.actions);
  const navigate = useNavigate();
  const { userData } = useUser();
  const iconRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useOutsideClick([iconRef, dropdownRef], "click", () =>
    setShowDropdown(false),
  );
  const handleActivateSearch = () => {
    setIsSearchActive(!isSearchActive);
  };
  const handleActiveElement = (list: ActiveList) => {
    setIsSearchActive(false);
    setCurrentActiveNavList(list);

    if (list === "user") {
      navigate(`/${userData?.username}`);
    } else if (list === "inbox") {
      navigate(`/inbox`);
    }
  };

  return (
    <>
      <Navbar
        iconRef={iconRef}
        dropdownRef={dropdownRef}
        handleActivateSearch={handleActivateSearch}
        handleActiveElement={handleActiveElement}
      />
      <AnimatePresence>
        {isSearchActive ? <SideSearch /> : null}
      </AnimatePresence>
    </>
  );
};

export default Header;
