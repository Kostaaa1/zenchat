import { FC, useEffect, useState } from "react";
import Icon from "../pages/main/components/Icon";
import Button from "./Button";
import useModalStore from "../utils/stores/modalStore";
import { trpcVanilla } from "../utils/trpcClient";
import { TMessage, TUserData } from "../../../server/src/types/types";
import useUser from "../hooks/useUser";
import { debounce } from "lodash";
import ChatList from "./ChatList";
import { cn } from "../utils/utils";

interface SendMessageModalProps {}

const SendMessageModal: FC<SendMessageModalProps> = () => {
  const { setIsSendMessageModalActive } = useModalStore();
  const [search, setSearch] = useState<string>("");
  const [searchedUsers, setSearchedUsers] = useState<TUserData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { userData } = useUser();
  const [selectedUsers, setSelectedUsers] = useState<TUserData[]>([]);

  const debounceEmit = debounce(
    async () => {
      if (!userData) {
        console.log("There is not user data.");
        return null;
      }

      const searchedUsers = await trpcVanilla.user.search.query({
        username: userData?.username,
        searchValue: search,
      });

      if (searchedUsers) {
        setSearchedUsers(searchedUsers);
        setLoading(false);
      }
    },
    Math.floor(Math.random() * 500 + 300),
  );

  useEffect(() => {
    setLoading(true);
    if (search.length === 0) {
      setSearchedUsers([]);
      setLoading(false);
      return;
    }
    debounceEmit();

    return () => {
      debounceEmit.cancel();
    };
  }, [search, userData]);

  const handleClick = (user: TUserData) => {
    console.log("Data", user);
    setSelectedUsers([...selectedUsers, user]);
  };

  return (
    <div className="absolute z-[1000] flex h-full w-screen items-center justify-center overflow-hidden bg-black bg-opacity-70">
      <div className="flex h-[600px] w-[500px] flex-col items-start rounded-xl bg-[#2d2d2d] pb-0 text-center">
        <div className="relative flex w-full items-center justify-between p-3">
          <span></span>
          <p className="font-semibold">New message</p>
          <Icon
            className="absolute right-0 top-0 -translate-y-1/2"
            name="X"
            onClick={() => setIsSendMessageModalActive(false)}
          />
        </div>
        <div className="relative flex h-max w-full border border-x-0 border-y-neutral-600 py-2">
          <span className="w-16">To:</span>
          <input
            type="text"
            placeholder="Search"
            className="bg-inherit outline-none placeholder:text-zinc-400"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
          />
        </div>
        <div
          className={cn(
            "h-full w-full",
            !loading ? "overflow-y-auto" : "overflow-hidden",
          )}
        >
          {!loading ? (
            <>
              {searchedUsers.length !== 0 ? (
                <div>
                  {searchedUsers.map((user) => (
                    <ChatList
                      title={user?.username}
                      key={user?.id}
                      image_url={user?.image_url}
                      hover="darker"
                      avatarSize="md"
                      subtitle={`${user?.first_name} ${user?.last_name}`}
                      onClick={() => handleClick(user)}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-4 text-sm text-zinc-400">
                  No results found.
                </div>
              )}
            </>
          ) : (
            Array(7)
              .fill("")
              .map((_, id) => (
                <div
                  key={id}
                  className="flex animate-pulse items-center px-6 py-2"
                >
                  <div className="block h-12 w-12 rounded-full bg-neutral-700"></div>
                  <div className="ml-4 flex h-full flex-col justify-between py-[6px]">
                    <div className="mb-2 h-4 w-[320px] rounded-lg bg-neutral-700"></div>
                    <div className="h-4 w-[120px] rounded-lg bg-neutral-700"></div>
                  </div>
                </div>
              ))
          )}
        </div>
        <div className="w-full">
          <Button
            buttonColor="blue"
            className="w-full"
            size="lg"
            disabled={search.length === 0}
          >
            Chat
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SendMessageModal;
