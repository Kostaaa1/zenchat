import { create } from "zustand"

export type ActiveList = "inbox" | "user" | ""

type Store = {
  showDropdown: boolean
  activeNavList: ActiveList
  isResponsive: boolean
  isMobile: boolean
  username: string | null
  volume: number
  actions: {
    setVolume: (volume: number) => void
    setIsMobile: (v: boolean) => void
    setUsername: (s: string) => void
    setIsResponsive: (isResponsive: boolean) => void
    setShowDropdown: (isShown: boolean) => void
    setActiveNavList: (list: ActiveList) => void
  }
}

const useGeneralStore = create<Store>(
  (set): Store => ({
    activeNavList: "",
    showDropdown: false,
    isResponsive: location.pathname.includes("inbox") || window.innerWidth <= 1024,
    isMobile: window.innerWidth <= 768,
    username: null,
    volume: 0.06,
    actions: {
      setVolume: (volume: number) => set({ volume }),
      setUsername: (username: string) => set({ username }),
      setIsResponsive: (isResponsive: boolean) => set({ isResponsive }),
      setIsMobile: (isMobile: boolean) => set({ isMobile }),
      setShowDropdown: (isShown: boolean) => set({ showDropdown: isShown }),
      setActiveNavList: (list) => set({ activeNavList: list })
    }
  })
)

export default useGeneralStore
