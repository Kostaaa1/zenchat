import { create } from "zustand";
import { TUserDataState } from "../../../../server/src/types/types";

type Store = {
  searchedUsers: TUserDataState[];
  search: string;
  isSearchingForUsers: boolean;
  isSearchActive: boolean;
  // isSearchFocused: boolean;
  actions: {
    // setIsSearchFocused: (v: boolean) => void;
    setIsSearchingForUsers: (v: boolean) => void;
    setIsSearchActive: (isActive: boolean) => void;
    setSearchedUsers: (searchedUsers: TUserDataState[]) => void;
    setSearch: (search: string) => void;
  };
};

const useSearchStore = create<Store>(
  (set): Store => ({
    search: "",
    searchedUsers: [],
    isSearchActive: false,
    isSearchingForUsers: false,
    // isSearchFocused: false,
    actions: {
      // setIsSearchFocused: (isSearchFocused) => set({ isSearchFocused }),
      setSearch: (search: string) => set({ search }),
      setIsSearchActive: (isActive: boolean) =>
        set({ isSearchActive: isActive }),
      setIsSearchingForUsers: (isSearchingForUsers: boolean) =>
        set({ isSearchingForUsers }),
      setSearchedUsers: (searchedUsers: TUserDataState[]) =>
        set({ searchedUsers }),
    },
  }),
);

export default useSearchStore;
