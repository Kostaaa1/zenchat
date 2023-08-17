import { create } from "zustand";

export type ActiveList = string | "inbox" | "home";

export interface IUserData {
  id: number;
  created_at: string;
  username: string;
  email: string;
  imageUrl: string;
}

type Store = {
  isSearchActive: boolean;
  setIsSearchActive: (isActive: boolean) => void;
  showDropdown: boolean;
  setShowDropdown: (isShown: boolean) => void;
  currentActiveList: ActiveList;
  setCurrentActiveList: (list: ActiveList) => void;
  searchedUsers: IUserData[];
  setSearchedUsers: (searchedUsers: IUserData[]) => void;
};

const useStore = create<Store>(
  (set): Store => ({
    searchedUsers: [],
    setSearchedUsers: (searchedUsers: IUserData[]) =>
      set((state) => ({
        ...state,
        searchedUsers: searchedUsers,
      })),
    currentActiveList: "",
    setCurrentActiveList: (list) =>
      set((state) => ({
        ...state,
        currentActiveList: list,
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
  })
);

export default useStore;
