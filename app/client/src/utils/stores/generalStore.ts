import { create } from "zustand";
import { TUserData } from "../../../../server/src/types/types";

export type ActiveList = "inbox" | "user" | "";

type Store = {
  isSearchActive: boolean;
  showDropdown: boolean;
  currentActiveNavList: ActiveList;
  searchedUsers: TUserData[];
  search: string;
  email: string;
  userId: string;
  actions: {
    setIsSearchActive: (isActive: boolean) => void;
    setShowDropdown: (isShown: boolean) => void;
    setCurrentActiveNavList: (list: ActiveList) => void;
    setSearchedUsers: (searchedUsers: TUserData[]) => void;
    setSearch: (search: string) => void;
    setEmail: (email: string) => void;
    setUserId: (id: string) => void;
  };
};

const useGeneralStore = create<Store>(
  (set): Store => ({
    /*  USER RELATED */
    email: "",
    userId: "",
    /* */
    search: "",
    searchedUsers: [],
    currentActiveNavList: "",
    showDropdown: false,
    isSearchActive: false,
    actions: {
      setSearch: (search: string) => set({ search }),
      setIsSearchActive: (isActive: boolean) =>
        set({ isSearchActive: isActive }),
      setShowDropdown: (isShown: boolean) => set({ showDropdown: isShown }),
      setCurrentActiveNavList: (list) => set({ currentActiveNavList: list }),
      setEmail: (email: string) => set({ email }),
      setUserId: (userId: string) => set({ userId }),
      setSearchedUsers: (searchedUsers: TUserData[]) => set({ searchedUsers }),
    },
  }),
);

export default useGeneralStore;
