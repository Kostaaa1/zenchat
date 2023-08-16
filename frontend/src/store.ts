import { create } from "zustand";

export type ActiveList = string | "inbox" | "home";

type Store = {
  isSearchActive: boolean;
  setIsSearchActive: (isActive: boolean) => void;
  showDropdown: boolean;
  setShowDropdown: (isShown: boolean) => void;
  currentActiveList: ActiveList;
  setCurrentActiveList: (list: ActiveList) => void;
};

const useStore = create<Store>(
  (set): Store => ({
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
