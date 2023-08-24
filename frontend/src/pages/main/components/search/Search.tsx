import { FC, useEffect, useRef, useState } from "react";
import Icon from "../Icon";
import useStore from "../../../../utils/store";
import { IUserData } from "../../../../utils/store";
import supabase from "../../../../../lib/supabaseClient";
import { useUser } from "@clerk/clerk-react";
import { useQueryClient } from "@tanstack/react-query";
import useCachedUser from "../../../../hooks/useCachedUser";
import io from "socket.io-client";
import { debounce } from "lodash";
const socket = io("http://localhost:3000"); // Replace with your server's URL

type SearchProps = {
  setLoading: (bool: boolean) => void;
};

const Search: FC<SearchProps> = ({ setLoading }) => {
  const [isSearchFocused, setIsSearchFocused] = useState<boolean | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const { setSearchedUsers, searchedUsers } = useStore();
  const [search, setSearch] = useState<string>("");
  const { userData } = useCachedUser();

  const handleConnect = () => {
    console.log("Connected to server");
  };

  const handleUsers = (users: IUserData[]) => {
    setSearchedUsers(users);
    setLoading(false);
  };

  const debouncedEmit = debounce((searchValue) => {
    if (!userData?.username) {
      console.log("There is no user data, lost cache");
      return;
    }
    socket.emit("users", [searchValue, userData?.username]);
  }, 400);

  const startDebounce = () => {
    if (search.length !== 0) {
      setLoading(true);
      debouncedEmit(search);
    } else {
      setLoading(false);
      setSearchedUsers([]);
    }
  };

  useEffect(() => {
    socket.on("connect", handleConnect);
    socket.on("search-users", handleUsers);
    startDebounce();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("search-users", handleUsers);
      debouncedEmit.cancel();
    };
  }, [search]);

  const handleChangeState = (event: MouseEvent) => {
    if (
      isSearchFocused &&
      searchRef.current &&
      !searchRef.current.contains(event.target as Node)
    ) {
      setIsSearchFocused(false);
    }
  };

  useEffect(() => {
    window.addEventListener("click", handleChangeState);
    return () => {
      window.removeEventListener("click", handleChangeState);
    };
  });

  return (
    <div className="relative flex select-none text-neutral-400" ref={searchRef}>
      {!isSearchFocused && (
        <Icon
          name="Search"
          size="18px"
          className="absolute bottom-1/2 translate-x-1/2 translate-y-1/2"
        />
      )}
      <input
        className={`${
          !isSearchFocused ? "pl-8" : "pl-4"
        } rounded-md bg-[#303030] py-2 text-neutral-400 placeholder-neutral-400 focus:text-white`}
        type="text"
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => setIsSearchFocused(false)}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search"
      />
      {isSearchFocused || isSearchFocused === null ? (
        <div
          className="absolute bottom-1/2 right-2 flex translate-y-1/2 items-center rounded-full bg-zinc-300 p-[2px] text-zinc-600"
          onClick={() => setSearch("")}
        >
          <Icon name="X" size="14px" />
        </div>
      ) : null}
    </div>
  );
};

export default Search;
