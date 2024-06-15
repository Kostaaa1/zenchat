import { FC, useRef } from "react";
import useGeneralStore from "../../stores/generalStore";
import Icon from "../Icon";
import { AnimatePresence } from "framer-motion";
import UserDropdown from "./UserDropdown";
import NavListItem from "../NavList";
import useOutsideClick from "../../hooks/useOutsideClick";

type NavHamburgerProps = {
  list?: "list" | "default";
};

const NavHamburger: FC<NavHamburgerProps> = ({ list }) => {
  const { setShowDropdown } = useGeneralStore((state) => state.actions);
  const iconRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const showDropdown = useGeneralStore((state) => state.showDropdown);
  const isResponsive = useGeneralStore((state) => state.isResponsive);
  useOutsideClick([iconRef, dropdownRef], "click", () =>
    setShowDropdown(false),
  );

  return (
    <div
      className="relative"
      onClick={() => setShowDropdown(!showDropdown)}
      ref={iconRef}
    >
      <NavListItem variant={list} title={isResponsive ? "" : "Menu"}>
        <Icon name="Menu" color="white" size="28px" />
      </NavListItem>
      <AnimatePresence>
        {showDropdown && <UserDropdown dropdownRef={dropdownRef} />}
      </AnimatePresence>
    </div>
  );
};

export default NavHamburger;
