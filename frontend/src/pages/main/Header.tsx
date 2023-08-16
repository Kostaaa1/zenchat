import Navbar from "./components/Navbar";
import SideSearch from "./components/search/SideSearch";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import useStore, { ActiveList } from "../../store";
import { useEffect, useRef } from "react";

const Header = () => {
  const {
    showDropdown,
    setCurrentActiveList,
    isSearchActive,
    setShowDropdown,
    setIsSearchActive,
  } = useStore();
  const navigate = useNavigate();
  const iconRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleActivateSearch = () => {
    setIsSearchActive(!isSearchActive);
  };

  const handleActiveElement = (list: ActiveList) => {
    setIsSearchActive(false);
    setCurrentActiveList(list);
    if (list === "home") {
      navigate("/");
    } else if (list === "inbox") {
      navigate("/inbox");
    }
  };

  const handleRefs = (e: MouseEvent) => {
    if (
      showDropdown &&
      iconRef.current &&
      !iconRef.current.contains(e.target as Node) &&
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target as Node)
    ) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    window.addEventListener("click", handleRefs);
    return () => {
      window.removeEventListener("click", handleRefs);
    };
  });

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
