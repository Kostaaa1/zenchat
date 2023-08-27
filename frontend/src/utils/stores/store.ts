import { create } from "zustand";

export type ActiveList = "inbox" | "user" | "";

export interface IUserData {
  id: string;
  created_at: string;
  username: string;
  email: string;
  image_url: string;
  first_name: string;
  last_name: string;
}

export interface TChat {
  id?: string;
  created_at?: string;
  last_message: string;
  userId1: number;
  userId2: number;
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
        searchedUsers,
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
  }),
);

export default useStore;
