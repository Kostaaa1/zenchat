import { useEffect, useRef, useState } from "react";
import Icon from "../Icon";
import UseUser from "../../hooks/useUser";
import { debounce } from "lodash";
import { trpc } from "../../utils/trpcClient";
import useSearchStore from "../../utils/state/searchStore";
import { cn } from "../../utils/utils";
import useGeneralStore from "../../utils/state/generalStore";

const SearchInput = () => {
  const { userData } = UseUser();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const search = useSearchStore((state) => state.search);
  const {
    setSearchedUsers,
    setIsSearchingForUsers,
    setSearch,
    setIsSearchActive,
  } = useSearchStore((state) => state.actions);
  const isSearchActive = useSearchStore((state) => state.isSearchActive);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const { user } = trpc.useUtils();
  const isMobile = useGeneralStore((state) => state.isMobile);

  const debounceEmit = debounce(
    async () => {
      if (!userData) {
        console.log("There is not user data.");
        return null;
      }
      const searchedUsers = await user.search.fetch({
        username: userData?.username,
        searchValue: search,
      });
      if (searchedUsers) {
        setSearchedUsers(searchedUsers);
        setIsSearchingForUsers(false);
      }
    },
    Math.floor(Math.random() * 500 + 300),
  );

  useEffect(() => {
    setIsSearchingForUsers(true);
    if (search.length === 0) {
      setSearchedUsers([]);
      setIsSearchingForUsers(false);
      return;
    }
    debounceEmit();
    return () => {
      debounceEmit.cancel();
    };
  }, [search, userData]);

  useEffect(() => {
    if (isSearchActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchActive]);

  const onInputFocus = () => {
    setIsSearchActive(true);
    setIsInputFocused(true);
  };

  const onInputBlur = () => {
    setIsSearchActive(false);
    setIsInputFocused(false);
  };

  return (
    <div className="relative flex select-none text-neutral-400" ref={searchRef}>
      <Icon
        name="Search"
        size="18px"
        className="absolute bottom-1/2 translate-x-1/2 translate-y-1/2"
      />
      <input
        className={cn(
          "rounded-md bg-[#303030] pl-8 text-neutral-400 placeholder-neutral-400 focus:text-white",
          isMobile ? "py-1" : "py-2",
        )}
        ref={inputRef}
        type="text"
        onFocus={onInputFocus}
        onBlur={onInputBlur}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search"
      />
      {isInputFocused ? (
        <div
          className="absolute bottom-1/2 right-2 flex translate-y-1/2 items-center rounded-full bg-zinc-300 p-[2px] text-zinc-500"
          onClick={() => setSearch("")}
        >
          <Icon name="X" size="14px" />
        </div>
      ) : null}
    </div>
  );
};

export default SearchInput;
