import useSearchStore from "../stores/searchStore"
import useUser from "./useUser"
import useGeneralStore, { ActiveList } from "../stores/generalStore"
import { useLocation, useNavigate } from "react-router-dom"
import useModalStore from "../stores/modalStore"
import { RefObject, useCallback, useEffect } from "react"
import useWindowSize from "./useWindowSize"
import type { icons } from "lucide-react"

export type NavListItems = {
  iconName?: keyof typeof icons
  iconStrokeWidth?: string
  title?: string
  onClick?: () => void
  ref?: RefObject<HTMLDivElement>
  className?: string
  route?: string
}

const useNavbar = () => {
  const navigate = useNavigate()
  const isSearchActive = useSearchStore((state) => state.isSearchActive)
  const { user } = useUser()
  const isResponsive = useGeneralStore((state) => state.isResponsive)
  const { openModal } = useModalStore((state) => state.actions)
  const { width } = useWindowSize()
  const location = useLocation()
  const activeNavList = useGeneralStore((state) => state.activeNavList)
  const { setIsSearchActive } = useSearchStore((state) => state.actions)
  const isMobile = useGeneralStore((state) => state.isMobile)
  const searchInputRef = useSearchStore((state) => state.searchInputRef)
  const { setActiveNavList, setIsResponsive } = useGeneralStore((state) => state.actions)
  const expendableLists: ActiveList[] = ["user"]

  useEffect(() => {
    if (!isSearchActive) setIsResponsive(location.pathname.includes("inbox") || width <= 1024)
  }, [width, location.pathname, isSearchActive])

  const handleActiveElement = useCallback(
    (list: ActiveList | null) => {
      if (list) {
        if (width >= 1024) setIsResponsive(!expendableLists.includes(list))
        setActiveNavList(list)
        setIsSearchActive(false)
        if (list === "user") {
          navigate(`/${user?.username}`)
        } else if (list === "inbox") {
          navigate(`/inbox`)
        }
      } else {
        setIsSearchActive(!isSearchActive)
        if (width >= 1024) {
          setIsResponsive(
            location.pathname.includes("inbox") || (!location.pathname.includes("inbox") && !isSearchActive)
          )
        }
        if (isMobile && location.pathname !== "/") navigate(`/${user!.username}`)
      }
    },
    [isSearchActive, location.pathname, isMobile, user]
  )

  const activeListClass = "bg-neutral-900"
  const navListItems: NavListItems[] = [
    {
      iconName: "MessageCircle",
      iconStrokeWidth: activeNavList === "inbox" ? "2" : "",
      title: isResponsive ? "" : "Messages",
      className: `${location.pathname.includes("/inbox") || activeNavList === "inbox" ? activeListClass : null}`,
      onClick: () => {
        handleActiveElement("inbox")
      }
    },
    {
      iconName: "Search",
      iconStrokeWidth: isSearchActive ? "2" : "",
      title: isResponsive ? "" : "Search",
      className: `${isSearchActive ? activeListClass : null} `,
      ref: searchInputRef,
      onClick: () => handleActiveElement(null)
    },
    {
      iconName: "PlusSquare",
      title: isResponsive ? "" : "Create",
      onClick: () => openModal("uploadpost")
    },
    {
      title: isResponsive ? "" : "Profile",
      className: `${location.pathname === `/${user?.username}` ? activeListClass : null}`,
      onClick: () => {
        handleActiveElement("user")
      }
    }
  ]

  return {
    navListItems,
    handleActiveElement
  }
}

export default useNavbar
