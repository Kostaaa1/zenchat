import { useEffect, useRef, useState } from "react";
import Icon from "../Icon";
import io from "socket.io-client";
import useStore from "../../../../utils/store";
const socket = io("http://localhost:3000"); // Replace with your server's URL
import { IUserData } from "../../../../utils/store";

const Search = () => {
  const [isSearchFocused, setIsSearchFocused] = useState<boolean | null>(null);
  const [search, setSearch] = useState<string>("");
  const searchRef = useRef<HTMLInputElement>(null);
  const { setSearchedUsers } = useStore();

  useEffect(() => {
    const handleConnect = () => {
      console.log("Connected to server");
    };
    const handleUsers = (users: IUserData[]) => {
      setSearchedUsers(users);
    };
    socket.on("connect", handleConnect);
    socket.on("users", handleUsers);
    if (search !== "") {
      socket.emit("users", search);
    }
    return () => {
      socket.off("connect", handleConnect);
      socket.off("users", handleUsers);
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
    <div className="relative flex text-neutral-400 select-none" ref={searchRef}>
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
        } py-2 text-neutral-400 focus:text-white bg-[#303030] placeholder-neutral-400 rounded-md`}
        type="text"
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => setIsSearchFocused(false)}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search"
      />
      {isSearchFocused || isSearchFocused === null ? (
        <div
          className="absolute right-2 rounded-full flex items-center bg-zinc-300 p-[2px] text-zinc-600 bottom-1/2 translate-y-1/2"
          onClick={() => setSearch("")}
        >
          <Icon name="X" size="14px" />
        </div>
      ) : null}
    </div>
  );
};

export default Search;
