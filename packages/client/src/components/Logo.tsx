import { SiZend } from "react-icons/si"
import NavList from "./NavList"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import useGeneralStore from "../stores/generalStore"
import useSearchStore from "../stores/searchStore"
import { FC } from "react"

type LogoProps = {
  isList?: boolean
}

const Logo: FC<LogoProps> = ({ isList = true }) => {
  const navigate = useNavigate()
  const isSearchActive = useSearchStore((state) => state.isSearchActive)
  const { setIsSearchActive } = useSearchStore((state) => state.actions)
  const isResponsive = useGeneralStore((state) => state.isResponsive)
  const isMobile = useGeneralStore((state) => state.isMobile)

  const handleLogoClick = () => {
    setIsSearchActive(false)
    navigate("/")
  }

  return (
    <>
      {!isList ? (
        <div className="mx-auto inline-flex items-center space-x-1">
          <SiZend size={isMobile ? 24 : 28} className="rotate-90" />
          <h1 className="text-2xl font-bold">Zenchat</h1>
        </div>
      ) : (
        <NavList
          onClick={handleLogoClick}
          head={!isMobile && isResponsive ? "" : "Zenchat"}
          hover="blank"
          variant={!isResponsive ? "default" : "list"}
        >
          <motion.div
            animate={{
              rotate: !isMobile && isSearchActive ? 90 : 0,
              transition: { duration: 0.3, ease: "easeInOut" }
            }}
          >
            <SiZend size={isMobile ? 24 : 28} className="rotate-90" />
          </motion.div>
        </NavList>
      )}
    </>
  )
}

export default Logo
