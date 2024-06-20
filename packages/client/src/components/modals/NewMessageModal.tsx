import { forwardRef, useEffect, useState } from "react"
import Icon from "../Icon"
import Button from "../Button"
import useModalStore from "../../stores/modalStore"
import { trpc } from "../../lib/trpcClient"
import { TUserDataState } from "../../../../server/src/types/types"
import useUser from "../../hooks/useUser"
import { debounce } from "lodash"
import List from "../List"
import { cn } from "../../utils/utils"
import { useNavigate } from "react-router-dom"
import { Modal } from "./Modals"

const NewMessageModal = forwardRef<HTMLDivElement>((_, ref) => {
  const [search, setSearch] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const { user } = useUser()
  const [searchedUsers, setSearchedUsers] = useState<TUserDataState[]>([])
  const [selectedUsers, setSelectedUsers] = useState<TUserDataState[]>([])
  const navigate = useNavigate()
  const utils = trpc.useUtils()
  const { closeModal } = useModalStore((state) => state.actions)

  const debounceEmit = debounce(
    async () => {
      if (!user) return null
      const searchedUsers = await utils.user.search.fetch({
        username: user?.username,
        searchValue: search
      })
      if (searchedUsers) {
        setSearchedUsers(searchedUsers)
        setLoading(false)
      }
    },
    Math.floor(Math.random() * 400 + 150)
  )

  useEffect(() => {
    setLoading(true)
    if (search.length === 0) {
      setSearchedUsers([])
      setLoading(false)
      return
    }
    debounceEmit()
    return () => {
      debounceEmit.cancel()
    }
  }, [search, user])

  const handleClick = (user: TUserDataState) => {
    setSearch("")
    setSelectedUsers((state) => {
      return state.some((x) => x.id === user.id) ? state : [...state, user]
    })
  }

  const handleRemoveSelectedUser = (id: string) => {
    setSelectedUsers((state) => state.filter((x) => x.id !== id))
  }

  const handlaCreateChatroom = async () => {
    setLoading(true)
    const userIds = selectedUsers.map((x) => x.id)
    const newChatroomId = await utils.chat.get.chatroom_id.fetch({
      userIds: [...userIds, user!.id],
      admin: user!.id
    })
    await utils.chat.get.user_chatrooms.refetch(user!.id)
    if (newChatroomId) {
      closeModal()
      setLoading(false)
      navigate(`/inbox/${newChatroomId}`)
    }
  }

  return (
    <Modal>
      <div
        ref={ref}
        className="flex h-[80vw] max-h-[640px] w-[90vw] max-w-[520px] flex-col items-start rounded-xl bg-[#282828] pb-0 text-center"
      >
        <div className="relative flex w-full items-center justify-between border-[1px] border-x-0 border-t-0 border-b-neutral-600 p-3">
          <span></span>
          <p className="font-semibold">New Message</p>
          <Icon className="absolute right-0 top-0 -translate-y-1/2" name="X" onClick={closeModal} />
        </div>
        <div className="relative flex h-max w-full items-start border border-x-0 border-y-neutral-600 px-2 py-1 font-semibold">
          <span className="pointer-events-none py-1 pr-3">To:</span>
          <div className="flex w-full flex-wrap">
            {selectedUsers.length > 0 ? (
              <>
                {selectedUsers.map((x, id) => (
                  <div key={id} className="py-1 pr-2">
                    <div className="flex cursor-pointer items-center rounded-2xl bg-[#E0F1FF] px-2 py-1 text-xs">
                      <span className="text-lightBlue hover:text-opacity-30">{x.username}</span>
                      <Icon
                        className="ml-1 text-lightBlue"
                        name="X"
                        size="18px"
                        onClick={() => handleRemoveSelectedUser(x.id)}
                      />
                    </div>
                  </div>
                ))}
              </>
            ) : null}
            <div className="flex-grow">
              <input
                type="text"
                placeholder="Search"
                className="w-full bg-inherit py-1 font-normal outline-none placeholder:text-zinc-400"
                onChange={(e) => setSearch(e.target.value)}
                value={search}
              />
            </div>
          </div>
        </div>
        <ul className={cn("h-full w-full", !loading ? "overflow-y-auto" : "overflow-hidden")}>
          {!loading ? (
            <>
              {searchedUsers.length !== 0 ? (
                <>
                  {searchedUsers.map((user) => (
                    <List
                      title={user?.username}
                      avatarSize="lg"
                      padding="sm"
                      key={user?.id}
                      image_url={[user.image_url]}
                      hover="darker"
                      subtitle={`${user?.first_name} ${user?.last_name}`}
                      onClick={() => handleClick(user)}
                      isLoading={loading}
                    />
                  ))}
                </>
              ) : (
                <div className="p-2 py-4 text-start text-sm text-zinc-400">No results found.</div>
              )}
            </>
          ) : (
            Array(7)
              .fill("")
              .map((_, id) => (
                <div key={id} className="py-2">
                  <div className="flex h-14 w-full animate-pulse items-center space-x-4 px-2">
                    <div className="h-full w-14 overflow-hidden rounded-full bg-neutral-700"></div>
                    <div className="flex h-full w-2/3 flex-col justify-center">
                      <div className="mb-2 h-4 w-full rounded-lg bg-neutral-700"></div>
                      <div className="h-4 w-64 rounded-lg bg-neutral-700"></div>
                    </div>
                  </div>
                </div>
              ))
          )}
        </ul>
        <div className="w-full">
          <Button
            buttonColor="blue"
            className="w-full font-semibold"
            size="lg"
            onClick={handlaCreateChatroom}
            isLoading={loading}
            disabled={(selectedUsers.length === 0 && search.length === 0) || loading}
          >
            Chat
          </Button>
        </div>
      </div>
    </Modal>
  )
})

export default NewMessageModal
