import { create } from "zustand";
import { TUserData } from "../../../../server/src/types/types";

export type ActiveList = "inbox" | "user" | "";

type Store = {
  isSearchActive: boolean;
  setIsSearchActive: (isActive: boolean) => void;
  showDropdown: boolean;
  setShowDropdown: (isShown: boolean) => void;
  currentActiveNavList: ActiveList;
  setCurrentActiveNavList: (list: ActiveList) => void;
  searchedUsers: TUserData[];
  setSearchedUsers: (searchedUsers: TUserData[]) => void;
  email: string;
  setEmail: (email: string) => void;
  userId: string;
  setUserId: (id: string) => void;
  search: string;
  setSearch: (search: string) => void;
};

const useStore = create<Store>(
  (set): Store => ({
    search: "",
    setSearch: (search: string) =>
      set((state) => ({
        ...state,
        search,
      })),
    userId: "",
    setUserId: (userId: string) =>
      set((state) => ({
        ...state,
        userId,
      })),
    email: "",
    setEmail: (email: string) =>
      set((state) => ({
        ...state,
        email,
      })),
    searchedUsers: [],
    setSearchedUsers: (searchedUsers: TUserData[]) =>
      set((state) => ({
        ...state,
        searchedUsers,
      })),
    currentActiveNavList: "",
    setCurrentActiveNavList: (list) =>
      set((state) => ({
        ...state,
        currentActiveNavList: list,
      })),
    showDropdown: false,
    setShowDropdown: (isShown) =>
      set((state) => ({
        ...state,
        showDropdown: isShown,
      })),
    isSearchActive: false,
    setIsSearchActive: (isActive: boolean) =>
      set((state) => ({
        ...state,
        isSearchActive: isActive,
      })),
  }),
);

export default useStore;
