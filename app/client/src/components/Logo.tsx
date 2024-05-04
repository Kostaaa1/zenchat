import { SiZend } from "react-icons/si";
import NavList from "./NavList";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useGeneralStore from "../utils/state/generalStore";
import useSearchStore from "../utils/state/searchStore";

const Logo = () => {
  const navigate = useNavigate();
  const isSearchActive = useSearchStore((state) => state.isSearchActive);
  const { setIsSearchFocused } = useSearchStore((state) => state.actions);
  const isResponsive = useGeneralStore((state) => state.isResponsive);
  const isMobile = useGeneralStore((state) => state.isMobile);
  const handleLogoClick = () => {
    setIsSearchFocused(true);
    navigate("/");
  };

  return (
    <div>
      <NavList
        onClick={handleLogoClick}
        head={!isMobile && isResponsive ? "" : "Zenchat"}
        hover="blank"
        variant={!isResponsive ? "default" : "list"}
      >
        <motion.div
          animate={{
            rotate: !isMobile && isSearchActive ? 90 : 0,
            transition: { duration: 0.3, ease: "easeInOut" },
          }}
        >
          <SiZend size={isMobile ? 24 : 28} className="rotate-90" />
        </motion.div>
      </NavList>
    </div>
  );
};

export default Logo;
