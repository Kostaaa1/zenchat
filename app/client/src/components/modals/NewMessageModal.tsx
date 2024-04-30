import React, { FC, RefObject, useEffect, useRef, useState } from "react";
import Icon from "../../pages/main/components/Icon";
import Button from "../Button";
import useModalStore from "../../utils/stores/modalStore";
import { trpc } from "../../utils/trpcClient";
import { TUserDataState } from "../../../../server/src/types/types";
import useUser from "../../hooks/useUser";
import { debounce } from "lodash";
import List from "../List";
import { cn } from "../../utils/utils";
import { useNavigate } from "react-router-dom";
import { Modal } from "./Modals";

type NewMessageModalProps = {
  modalRef: RefObject<HTMLDivElement>;
};

const NewMessageModal: FC<NewMessageModalProps> = ({ modalRef }) => {
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { userData } = useUser();
  const [searchedUsers, setSearchedUsers] = useState<TUserDataState[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<TUserDataState[]>([]);
  const navigate = useNavigate();
  const { user, chat } = trpc.useUtils();
  const { setIsNewMessageModalModalOpen } = useModalStore(
    (state) => state.actions,
  );
  const closeSendMessageModal = () => {
    setIsNewMessageModalModalOpen(false);
  };

  const debounceEmit = debounce(
    async () => {
      if (!userData) return null;
      const searchedUsers = await user.search.fetch({
        username: userData?.username,
        searchValue: search,
      });

      if (searchedUsers) {
        setSearchedUsers(searchedUsers);
        setLoading(false);
      }
    },
    Math.floor(Math.random() * 400 + 150),
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

  const handleClick = (user: TUserDataState) => {
    setSearch("");
    setSelectedUsers((state) => {
      return state.some((x) => x.id === user.id) ? state : [...state, user];
    });
  };

  const handleRemoveSelectedUser = (id: string) => {
    setSelectedUsers((state) => state.filter((x) => x.id !== id));
  };

  const handleClickChat = async () => {
    setLoading(true);
    const userIds = selectedUsers.map((x) => x.id);
    const newChatroomId = await chat.get.chatroom_id.fetch({
      userIds: [...userIds, userData!.id],
      admin: userData!.id,
    });
    await chat.get.user_chatrooms.refetch(userData!.id);
    // const newChat = await chat.get.currentChatRoom.fetch({
    //   chatroom_id: newChatroomId as string,
    //   user_id: userData!.id,
    // });
    // if (newChat) {
    //   chat.get.user_chatrooms.setData(userData!.id, (stale) => {
    //     if (stale) return [newChat, ...stale];
    //   });
    // }
    if (newChatroomId) {
      closeSendMessageModal();
      setLoading(false);
      navigate(`/inbox/${newChatroomId}`);
    }
  };

  return (
    <Modal>
      <div
        ref={modalRef}
        className="flex h-[620px] w-[520px] flex-col items-start rounded-xl bg-[#282828] pb-0 text-center"
      >
        <div className="relative flex w-full items-center justify-between border-[1px] border-x-0 border-t-0 border-b-neutral-600 p-3">
          <span></span>
          <p className="font-semibold">New Message</p>
          <Icon
            className="absolute right-0 top-0 -translate-y-1/2"
            name="X"
            onClick={closeSendMessageModal}
          />
        </div>
        <div className="relative flex h-max w-full items-start border border-x-0 border-y-neutral-600 px-2 py-1 font-semibold">
          <span className="pointer-events-none py-1 pr-4">To:</span>
          <div className="flex w-full flex-wrap">
            {selectedUsers.length > 0 ? (
              <>
                {selectedUsers.map((x, id) => (
                  <div key={id} className="py-1 pr-2">
                    <div className="flex cursor-pointer items-center rounded-2xl bg-[#E0F1FF] px-2 py-1 text-xs">
                      <span className="text-lightBlue hover:text-opacity-30">
                        {x.username}
                      </span>
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
                    <List
                      title={user?.username}
                      key={user?.id}
                      image_url={[user.image_url]}
                      hover="darker"
                      subtitle={`${user?.first_name} ${user?.last_name}`}
                      onClick={() => handleClick(user)}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-2 py-4 text-start text-sm text-zinc-400">
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
                    <div className="mb-2 h-4 w-[300px] rounded-lg bg-neutral-700"></div>
                    <div className="h-4 w-[120px] rounded-lg bg-neutral-700"></div>
                  </div>
                </div>
              ))
          )}
        </div>
        <div className="w-full">
          <Button
            buttonColor="blue"
            className="w-full font-semibold"
            size="lg"
            disabled={
              (selectedUsers.length === 0 && search.length === 0) || loading
            }
            onClick={handleClickChat}
            isLoading={loading}
          >
            Chat
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default NewMessageModal;
