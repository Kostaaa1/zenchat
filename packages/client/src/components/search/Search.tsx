import { motion } from "framer-motion"
import SearchInput from "./SearchInput"
import { FC, ReactNode } from "react"
import List from "../List"
import { useNavigate } from "react-router-dom"
import useUser from "../../hooks/useUser"
import RecentSearchedUsers from "./RecentSearchedUsers"
import { cn } from "../../utils/utils"
import useGeneralStore from "../../stores/generalStore"
import { trpc } from "../../lib/trpcClient"
import useSearchStore from "../../stores/searchStore"
import useWindowSize from "../../hooks/useWindowSize"

const SearchWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  const isMobile = useGeneralStore((state) => state.isMobile)
  return !isMobile ? (
    <motion.div
      className="fixed left-[80px] top-0 z-40 flex h-full w-full max-w-sm flex-col border-r border-[#262626] bg-black"
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ type: "spring", damping: 35, stiffness: 300 }}
    >
      {children}
    </motion.div>
  ) : (
    <motion.div className="absolute right-4 top-14 z-[1000] h-max w-[50vw] max-w-[300px] overflow-auto rounded-2xl bg-neutral-800">
      {children}
    </motion.div>
  )
}

const Search = () => {
  const navigate = useNavigate()
  const search = useSearchStore((state) => state.search)
  const searchedUsers = useSearchStore((state) => state.searchedUsers)
  const isMobile = useGeneralStore((state) => state.isMobile)
  const { setIsResponsive } = useGeneralStore((state) => state.actions)
  const { width } = useWindowSize()
  const { setIsSearchActive, setSearch } = useSearchStore((state) => state.actions)
  const isSearchingForUsers = useSearchStore((state) => state.isSearchingForUsers)
  const { user } = useUser()
  const utils = trpc.useUtils()
  const addToHistoryMutation = trpc.chat.history.addUser.useMutation({
    onSuccess: () => {
      utils.chat.history.getAll.refetch()
    }
  })

  const navigateToUserDashboard = (username: string) => {
    navigate(`/${username}`)
    setIsSearchActive(false)
    setIsResponsive(false)
  }

  const handleClickUser = async ({ username, id }: { username: string; id: string }) => {
    if (!username && !id) return
    setSearch("")
    addToHistoryMutation.mutate({
      main_user_id: user?.id as string,
      user_id: id
    })
    navigateToUserDashboard(username)
  }

  const mockUserCount = isMobile ? 4 : 12

  return (
    <SearchWrapper>
      {!isMobile && (
        <div className="flex h-full max-h-[140px] w-full flex-col justify-between border-b border-[#262626] p-6">
          <h1 className="text-2xl font-bold">Search</h1>
          <SearchInput />
        </div>
      )}
      <div className={cn("h-full w-full", !isSearchingForUsers ? "overflow-y-auto" : "overflow-hidden")}>
        {!isSearchingForUsers ? (
          <>
            {search.length === 0 || searchedUsers.length === 0 ? (
              <RecentSearchedUsers navigateToUserDashboard={navigateToUserDashboard} />
            ) : (
              <>
                {searchedUsers.length !== 0 ? (
                  <ul>
                    {searchedUsers.map((user) => (
                      <List
                        title={user?.username}
                        key={user?.id}
                        image_url={[user?.image_url]}
                        padding={isMobile ? "md" : "lg"}
                        avatarSize={width > 480 ? "lg" : "md"}
                        hover="darker"
                        subtitle={`${user?.first_name} ${user?.last_name}`}
                        onClick={() => {
                          const { username, id } = user
                          handleClickUser({
                            username,
                            id
                          })
                        }}
                      />
                    ))}
                  </ul>
                ) : (
                  <div className="border-1 flex h-full max-h-full w-full items-center justify-center">
                    No results found.
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          Array(mockUserCount)
            .fill("")
            .map((_, id) => <List key={id} padding={isMobile ? "md" : "md"} isLoading={isSearchingForUsers} />)
        )}
      </div>
    </SearchWrapper>
  )
}

export default Search
