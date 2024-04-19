import { create } from "zustand";
import { TUserData } from "../../../../server/src/types/types";

export type ActiveList = "inbox" | "user" | "";

type Store = {
  isSearchActive: boolean;
  showDropdown: boolean;
  currentActiveNavList: ActiveList;
  searchedUsers: TUserData[];
  search: string;
  isResponsive: boolean;
  actions: {
    setIsResponsive: (isResponsive: boolean) => void;
    setIsSearchActive: (isActive: boolean) => void;
    setShowDropdown: (isShown: boolean) => void;
    setCurrentActiveNavList: (list: ActiveList) => void;
    setSearchedUsers: (searchedUsers: TUserData[]) => void;
    setSearch: (search: string) => void;
  };
};

const useGeneralStore = create<Store>(
  (set): Store => ({
    search: "",
    searchedUsers: [],
    currentActiveNavList: "",
    showDropdown: false,
    isSearchActive: false,
    isResponsive: false,
    actions: {
      setIsResponsive: (isResponsive: boolean) => set({ isResponsive }),
      setSearch: (search: string) => set({ search }),
      setIsSearchActive: (isActive: boolean) =>
        set({ isSearchActive: isActive }),
      setShowDropdown: (isShown: boolean) => set({ showDropdown: isShown }),
      setCurrentActiveNavList: (list) => set({ currentActiveNavList: list }),
      setSearchedUsers: (searchedUsers: TUserData[]) => set({ searchedUsers }),
    },
  }),
);

export default useGeneralStore;
