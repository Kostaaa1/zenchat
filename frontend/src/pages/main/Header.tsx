import Navbar from "./components/Navbar";
import SideSearch from "./components/search/SideSearch";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import useStore, { ActiveList } from "../../utils/store";
import { useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import supabase from "../../../lib/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { IUserData } from "../../utils/store";

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
  const { user } = useUser();

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

  const getUserDataFromDb = async (): Promise<IUserData | null> => {
    try {
      if (!user) return null;

      const { username, imageUrl } = user;
      const email = user.emailAddresses[0]?.emailAddress;

      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("email", email);

      const typedUserData = userData as IUserData[];

      if (!typedUserData || typedUserData.length === 0) {
        const { data: newUserData } = await supabase
          .from("users")
          .insert({ username, imageUrl, email })
          .select("*");

        const typedNewUserData = newUserData as IUserData[];
        return typedNewUserData[0] || null;
      } else {
        return typedUserData[0];
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const { data: userData } = useQuery(
    ["userData", user?.username],
    getUserDataFromDb,
    {
      enabled: !!user,
    }
  );

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
