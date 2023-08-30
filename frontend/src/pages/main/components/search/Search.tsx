import { FC, useEffect, useRef, useState } from "react";
import Icon from "../Icon";
import useStore from "../../../../utils/stores/store";
import { IUserData } from "../../../../utils/stores/store";
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
  const { setSearchedUsers } = useStore();
  const [search, setSearch] = useState<string>("");
  const { userData } = useCachedUser();
  const searchUsersSocket = "search-users";

  const handleSearchUsers = async (
    currentSearch: string,
  ): Promise<IUserData[] | undefined> => {
    try {
      console.log(currentSearch);
      const { data: users, error } = await supabase
        .from("users")
        .select("*")
        .not("username", "eq", userData?.username)
        .ilike("username", `${currentSearch}%`);

      if (!users || error) {
        console.error("Supabase query error:", error.message);
        return;
      }

      return users;
    } catch (error) {
      console.error("Error occured while joining the room", error);
    }
  };

  const debouncedEmit = debounce(async () => {
    if (!userData?.username) {
      console.log("There is no user data, lost cache");
      return;
    }
    const currentSearch = search;
    const data = await handleSearchUsers(currentSearch);

    if (data) {
      setSearchedUsers(data);
      setLoading(false);
    }
  }, 400);

  const startDebounce = () => {
    if (search.length !== 0) {
      setLoading(true);
      debouncedEmit();
    } else {
      setSearchedUsers([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    startDebounce();

    return () => {
      debouncedEmit.cancel();
    };
  }, [search]);

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
