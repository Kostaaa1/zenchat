import { create } from "zustand";
import { TUserDataState } from "../../../server/src/types/types";
import { RefObject, createRef } from "react";

type Store = {
  searchedUsers: TUserDataState[];
  search: string;
  isSearchingForUsers: boolean;
  isSearchActive: boolean;
  searchRef: RefObject<HTMLDivElement>;
  searchInputRef: RefObject<HTMLInputElement>;
  actions: {
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
    searchRef: createRef<HTMLDivElement>(),
    searchInputRef: createRef<HTMLInputElement>(),
    actions: {
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
