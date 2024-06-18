import { useEffect, useState } from "react"
import Icon from "../Icon"
import UseUser from "../../hooks/useUser"
import { debounce } from "lodash"
import { trpc } from "../../lib/trpcClient"
import useSearchStore from "../../stores/searchStore"
import { cn } from "../../utils/utils"
import useGeneralStore from "../../stores/generalStore"
import { loadImage } from "../../utils/image"

const SearchInput = () => {
  const { userData } = UseUser()
  const inputRef = useSearchStore((state) => state.searchInputRef)
  const search = useSearchStore((state) => state.search)
  const isSearchActive = useSearchStore((state) => state.isSearchActive)
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false)
  const { user } = trpc.useUtils()
  const isMobile = useGeneralStore((state) => state.isMobile)
  const { setSearchedUsers, setIsSearchingForUsers, setSearch, setIsSearchActive } = useSearchStore(
    (state) => state.actions
  )

  const debounceEmit = debounce(
    async () => {
      if (!userData) {
        console.log("There is not user data.")
        return null
      }
      const searchedUsers = await user.search.fetch({
        username: userData?.username,
        searchValue: search
      })
      if (searchedUsers) {
        setSearchedUsers(searchedUsers)

        await Promise.all(
          searchedUsers.map(async (x) => {
            if (x.image_url) await loadImage(x.image_url)
          })
        )
        setIsSearchingForUsers(false)
      }
    },
    Math.floor(Math.random() * 500 + 300)
  )

  useEffect(() => {
    setIsSearchingForUsers(true)
    if (search.length === 0) {
      setSearchedUsers([])
      setIsSearchingForUsers(false)
      return
    }
    debounceEmit()
    return () => {
      debounceEmit.cancel()
    }
  }, [search, userData])

  useEffect(() => {
    if (isSearchActive && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isSearchActive])

  const onInputFocus = () => {
    setIsSearchActive(true)
    setIsInputFocused(true)
  }

  // const onInputBlur = () => {
  //   // setIsSearchActive(false);
  //   setIsInputFocused(false);
  // };

  useEffect(() => {
    setIsInputFocused(false)
  }, [])

  return (
    <div className="relative flex select-none text-neutral-400">
      <Icon
        name="Search"
        size="18px"
        className="absolute bottom-1/2 translate-x-1/2 translate-y-1/2"
        onClick={onInputFocus}
      />
      <input
        className={cn(
          "rounded-md bg-[#303030] pl-8 text-neutral-400 placeholder-neutral-400 focus:text-white",
          isMobile ? "py-1" : "py-2"
        )}
        ref={inputRef}
        type="text"
        onFocus={onInputFocus}
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
  )
}

export default SearchInput
