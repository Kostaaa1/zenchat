import Navbar from "./components/Navbar";
import SideSearch from "./components/search/SideSearch";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import useStore, { ActiveList } from "../../store";
import { useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import supabase from "../../../lib/supabaseClient";

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

  useEffect(() => {
    if (user) {
      getUserDataFromDb();
    }
  }, [user]);

  const getUserDataFromDb = async () => {
    try {
      if (!user) return;
      const { username, imageUrl } = user;
      const email = user.emailAddresses[0]?.emailAddress;

      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("email", email);

      if (userData && userData.length === 0) {
        const { data: newUserData } = await supabase
          .from("users")
          .insert({ username, imageUrl, email })
          .select("*");
        console.log("new User data create", newUserData);
      } else {
        console.log(userData);
      }

      // return await supabase.from("messages").insert({ room, message, user_id });
    } catch (error) {
      console.error(error);
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
