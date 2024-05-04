import React, { FC } from "react";
import useGeneralStore from "../../utils/state/generalStore";
import Icon from "../Icon";
import { AnimatePresence } from "framer-motion";
import UserDropdown from "./UserDropdown";
import NavListItem from "../NavList";

type NavHamburgerProps = {
  iconRef: React.RefObject<HTMLDivElement>;
  dropdownRef: React.RefObject<HTMLDivElement>;
  list?: "list" | "default";
};

const NavHamburger: FC<NavHamburgerProps> = ({
  iconRef,
  dropdownRef,
  list,
}) => {
  const { setShowDropdown } = useGeneralStore((state) => state.actions);
  const showDropdown = useGeneralStore((state) => state.showDropdown);
  const isResponsive = useGeneralStore((state) => state.isResponsive);

  return (
    <div
      className="relative"
      ref={iconRef}
      onClick={() => setShowDropdown(!showDropdown)}
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
