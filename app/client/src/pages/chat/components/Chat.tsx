import React, { FC, useEffect, useRef, useState } from "react";
import Button from "../../../components/Button";
import { TChatroom, TMessage } from "../../../../../server/src/types/types";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useChatStore from "../../../lib/stores/chatStore";
import { trpc } from "../../../lib/trpcClient";
import { debounce } from "lodash";
import useUser from "../../../hooks/useUser";
import RenderAvatar from "../../../components/avatar/RenderAvatar";
import Message from "./Message";
import useModalStore from "../../../lib/stores/modalStore";
import useOutsideClick from "../../../hooks/useOutsideClick";
import useChatCache from "../../../hooks/useChatCache";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";

type ChatProps = {
  scrollRef: React.RefObject<HTMLDivElement>;
  activeChatroom: TChatroom;
  messages: TMessage[];
  isLoading: boolean;
};

const Chat: FC<ChatProps> = ({
  scrollRef,
  isLoading,
  messages,
  activeChatroom,
}) => {
  const MESSAGE_FETCH_LIMIT = 22;
  const iconRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [lastMessageDate, setLastMessageDate] = useState<string>("");
  const unsendMsgData = useModalStore((state) => state.unsendMsgData);
  const { setUnsendMsgData } = useModalStore((state) => state.actions);
  const { userData } = useUser();
  const utils = trpc.useUtils();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { updateUserReadMessage } = useChatCache();
  const {
    decrementUnreadMessagesCount,
    setShouldFetchMoreMessages,
    setShowDetails,
  } = useChatStore((state) => state.actions);

  useOutsideClick([dropdownRef], "mousedown", () => {
    setUnsendMsgData(null);
  });

  const { activeChatroomTitle, shouldFetchMoreMessages } = useChatStore(
    (state) => ({
      shouldFetchMoreMessages: state.shouldFetchMoreMessages,
      activeChatroomTitle: state.activeChatroomTitle,
    }),
  );

  const triggerReadMessagesMutation =
    trpc.chat.messages.triggerReadMessages.useMutation({
      onSuccess: () => {
        if (activeChatroom) {
          decrementUnreadMessagesCount();
          updateUserReadMessage(activeChatroom.chatroom_id, true);
        }
      },
      onError: (err) => {
        console.log("error", err);
      },
    });

  useEffect(() => {
    if (activeChatroom && userData) {
      const foundUser = activeChatroom.users.find(
        (x) => x.user_id === userData.id,
      );
      if (foundUser && !foundUser.is_message_seen) {
        console.log("Should trigger");
        triggerReadMessagesMutation.mutate(foundUser.id);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      setShowDetails(false);
    };
  }, []);

  const { mutateAsync: getMoreMutation } =
    trpc.chat.messages.getMore.useMutation({
      mutationKey: [
        {
          chatroom_id: activeChatroom?.chatroom_id,
        },
      ],
      onSuccess: (messages) => {
        if (!messages || !shouldFetchMoreMessages || !activeChatroom) return;
        utils.chat.messages.get.setData(
          {
            chatroom_id: activeChatroom.chatroom_id,
          },
          (staleChats) => {
            if (staleChats && messages) return [...staleChats, ...messages];
          },
        );
        if (messages.length < MESSAGE_FETCH_LIMIT) {
          setShouldFetchMoreMessages(false);
        }
      },
    });

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !activeChatroom) return;

    const fetchMoreMessagesObserver = debounce(() => {
      const { scrollTop, clientHeight, scrollHeight } = container;
      const scrollTolerance = 40;
      const diff = scrollHeight - clientHeight - scrollTolerance;

      if (Math.abs(scrollTop) >= diff && shouldFetchMoreMessages) {
        getMoreMutation({
          chatroom_id: activeChatroom?.chatroom_id,
          lastMessageDate,
        });
      }
    }, 300);
    container.addEventListener("scroll", fetchMoreMessagesObserver);
    return () => {
      container.removeEventListener("scroll", fetchMoreMessagesObserver);
      fetchMoreMessagesObserver.cancel();
    };
  });

  const handlePressMore = (message: TMessage) => {
    if (!unsendMsgData) {
      setUnsendMsgData(unsendMsgData ? null : message);
    } else {
      setUnsendMsgData(null);
    }
  };
  const scrollToStart = () => scrollRef.current?.scrollTo({ top: 0 });

  useEffect(() => {
    if (messages.length === 0 || messages.length < MESSAGE_FETCH_LIMIT) {
      setShouldFetchMoreMessages(false);
      return;
    }
    if (messages.length > 0) {
      setLastMessageDate(messages[messages.length - 1].created_at);
    }
  }, [messages]);

  return (
    <div className="relative flex w-full flex-col justify-between">
      <>
        <ChatHeader />
        {isLoading ? (
          <div className="flex h-full w-full justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
          </div>
        ) : (
          <div className={"flex h-full flex-col overflow-hidden px-2"}>
            <div
              className="flex h-full flex-col-reverse justify-between overflow-y-auto overflow-x-hidden"
              ref={scrollRef}
            >
              <ul className="flex flex-col-reverse space-y-1 px-4 pb-2">
                {messages?.map((message, id) => (
                  <Message
                    key={message.id}
                    ref={dropdownRef}
                    message={message}
                    onClick={() => handlePressMore(message)}
                    rounded1={
                      id + 1 < messages.length
                        ? messages[id + 1].sender_id !== message.sender_id
                        : id === messages.length - 1
                    }
                    rounded2={
                      (id - 1 >= 0 &&
                        messages[id - 1].sender_id !== message.sender_id) ||
                      id === 0
                    }
                  />
                ))}
              </ul>
              {shouldFetchMoreMessages && (
                <div className="flex w-full items-center justify-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
                </div>
              )}
              {!shouldFetchMoreMessages && activeChatroom && (
                <div className="flex flex-col items-center pb-8 pt-4">
                  <RenderAvatar
                    avatarSize="xl"
                    image_urls={
                      activeChatroom.is_group
                        ? {
                            image_url_1: activeChatroom.users[0]?.image_url,
                            image_url_2: activeChatroom.users[1]?.image_url,
                          }
                        : {
                            image_url_1: activeChatroom.users.find(
                              (x) => x.user_id !== userData?.id,
                            )?.image_url,
                          }
                    }
                  />
                  <div className="flex flex-col items-center pt-4">
                    <h3 className="text-md py-1 font-semibold">
                      {activeChatroom && activeChatroom?.users.length > 1
                        ? activeChatroomTitle
                        : activeChatroom?.users[0].username}
                    </h3>
                    {!activeChatroom?.is_group ? (
                      <Button
                        size="sm"
                        className="text-sm font-semibold"
                        onClick={() =>
                          navigate(`/${activeChatroom?.users[0].username}`)
                        }
                      >
                        View profile
                      </Button>
                    ) : (
                      <p className="text-sm font-bold text-neutral-400">
                        You created this group
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            {activeChatroom && (
              <MessageInput
                activeChatroom={activeChatroom}
                scrollToStart={scrollToStart}
                iconRef={iconRef}
              />
            )}
          </div>
        )}
      </>
    </div>
  );
};

const MemoizedChat = React.memo(Chat);
export default MemoizedChat;
