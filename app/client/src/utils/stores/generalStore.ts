import { create } from "zustand";
import { TUserDataState } from "../../../../server/src/types/types";

export type ActiveList = "inbox" | "user" | "";

type Store = {
  isSearchActive: boolean;
  showDropdown: boolean;
  currentActiveNavList: ActiveList;
  searchedUsers: TUserDataState[];
  search: string;
  isResponsive: boolean;
  username: string | null;
  actions: {
    setUsername: (s: string) => void;
    setIsResponsive: (isResponsive: boolean) => void;
    setIsSearchActive: (isActive: boolean) => void;
    setShowDropdown: (isShown: boolean) => void;
    setCurrentActiveNavList: (list: ActiveList) => void;
    setSearchedUsers: (searchedUsers: TUserDataState[]) => void;
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
    username: null,
    actions: {
      setUsername: (username: string) => set({ username }),
      setIsResponsive: (isResponsive: boolean) => set({ isResponsive }),
      setSearch: (search: string) => set({ search }),
      setIsSearchActive: (isActive: boolean) =>
        set({ isSearchActive: isActive }),
      setShowDropdown: (isShown: boolean) => set({ showDropdown: isShown }),
      setCurrentActiveNavList: (list) => set({ currentActiveNavList: list }),
      setSearchedUsers: (searchedUsers: TUserDataState[]) =>
        set({ searchedUsers }),
    },
  }),
);

export default useGeneralStore;
