import useSearchStore from "../../lib/stores/searchStore";
import Logo from "../Logo";
import Search from "../search/Search";
import SearchInput from "../search/SearchInput";

export const TopNav = () => {
  const isSearchActive = useSearchStore((state) => state.isSearchActive);
  return (
    <div className="flex items-center justify-between border-b border-[#232323] bg-black py-2 pr-4">
      <div>
        <Logo />
      </div>
      <SearchInput />
      {isSearchActive ? <Search /> : null}
    </div>
  );
};
