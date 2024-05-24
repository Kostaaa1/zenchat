import React, { FC, useEffect, useRef, useState } from "react";
import Button from "../../../components/Button";
import { TMessage } from "../../../../../server/src/types/types";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useChatStore, { TActiveChatroom } from "../../../utils/state/chatStore";
import { trpc } from "../../../utils/trpcClient";
import { debounce } from "lodash";
import useUser from "../../../hooks/useUser";
import RenderAvatar from "../../../components/avatar/RenderAvatar";
import Message from "./Message";
import useModalStore from "../../../utils/state/modalStore";
import { loadImage } from "../../../utils/utils";
import useOutsideClick from "../../../hooks/useOutsideClick";
import useChatCache from "../../../hooks/useChatCache";

type ChatProps = {
  scrollRef: React.RefObject<HTMLDivElement>;
  chatRoomId: string;
  activeChatroom: TActiveChatroom;
};

const Chat: FC<ChatProps> = ({ chatRoomId, activeChatroom, scrollRef }) => {
  const MESSAGE_FETCH_LIMIT = 22;
  const navigate = useNavigate();
  const [lastMessageDate, setLastMessageDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const unsendMsgData = useModalStore((state) => state.unsendMsgData);
  const { setUnsendMsgData } = useModalStore((state) => state.actions);
  const { userData } = useUser();
  const utils = trpc.useUtils();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLLIElement>(null);
  const { activeChatroomTitle, shouldFetchMoreMessages } = useChatStore(
    (state) => ({
      shouldFetchMoreMessages: state.shouldFetchMoreMessages,
      activeChatroomTitle: state.activeChatroomTitle,
    }),
  );
  const { updateUserReadMessage } = useChatCache();
  const {
    decrementUnreadMessagesCount,
    setShouldFetchMoreMessages,
    setActiveChatroom,
    setShowDetails,
  } = useChatStore((state) => state.actions);

  const triggerReadMessagesMutation =
    trpc.chat.messages.triggerReadMessages.useMutation({
      onSuccess: () => {
        console.log("Triggered", activeChatroom);
        if (activeChatroom) {
          decrementUnreadMessagesCount();
          updateUserReadMessage(activeChatroom.chatroom_id, true);
        }
      },
      onError: (err) => {
        console.log("error", err);
      },
    });

  // When does user see the message? on original mount of /inbox/... chat component, and when its scrolled into the message
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

  const { mutateAsync: getMoreMutation } =
    trpc.chat.messages.getMore.useMutation({
      mutationKey: [
        {
          chatroom_id: chatRoomId,
        },
      ],
      onSuccess: (messages) => {
        if (!messages || !shouldFetchMoreMessages) return;
        utils.chat.messages.get.setData(
          {
            chatroom_id: chatRoomId,
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

  const { data: messages } = trpc.chat.messages.get.useQuery(
    { chatroom_id: chatRoomId as string },
    { enabled: !!chatRoomId },
  );

  useOutsideClick([dropdownRef], "mousedown", () => {
    setUnsendMsgData(null);
  });

  useEffect(() => {
    return () => {
      setActiveChatroom(null);
      setShowDetails(false);
    };
  }, []);

  const loadImages = async (messages: TMessage[]) => {
    try {
      await Promise.all(
        messages
          .filter((x) => x.is_image)
          .map(async (msg) => await loadImage(msg.content)),
      );
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!messages) return;
    const msgImgs = messages.filter((x) => x.is_image);
    loadImages(msgImgs);
    if (messages.length === 0 || messages.length < MESSAGE_FETCH_LIMIT) {
      setShouldFetchMoreMessages(false);
      return;
    }
    if (messages.length > 0) {
      setLastMessageDate(messages[messages.length - 1].created_at);
    }
  }, [messages]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const fetchMoreMessagesObserver = debounce(() => {
      const { scrollTop, clientHeight, scrollHeight } = container;
      const scrollTolerance = 40;
      const diff = scrollHeight - clientHeight - scrollTolerance;
      if (Math.abs(scrollTop) >= diff && shouldFetchMoreMessages) {
        getMoreMutation({
          chatroom_id: chatRoomId,
          lastMessageDate: lastMessageDate,
        });
      }
    }, 300);

    // const firstMessageObserver = (e: Event) => {
    //   if (e.currentTarget && e.currentTarget.scrollTop === 0 && userData) {
    //     console.log("FOund event FOUND LAST MESSAGE::::", e);
    //     triggerReadMessagesMutation.mutate(userData.id);
    //   }
    // };

    // container.addEventListener("scroll", firstMessageObserver);
    container.addEventListener("scroll", fetchMoreMessagesObserver);
    return () => {
      // container.removeEventListener("scroll", firstMessageObserver);
      container.removeEventListener("scroll", fetchMoreMessagesObserver);
      fetchMoreMessagesObserver.cancel();
    };
  });

  const handlePressMore = (message: TMessage) => {
    const { is_image, content, id } = message;
    if (!unsendMsgData) {
      setUnsendMsgData(
        unsendMsgData ? null : { id, imageUrl: is_image ? content : null },
      );
    } else {
      setUnsendMsgData(null);
    }
  };

  return (
    <div id="chatdiv" className="flex h-full flex-col overflow-hidden">
      {loading ? (
        <div className="flex w-full items-center justify-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
        </div>
      ) : (
        <div
          className="flex h-full flex-col-reverse justify-between overflow-y-auto overflow-x-hidden"
          ref={scrollRef}
        >
          <ul className="flex flex-col-reverse p-3">
            {messages?.map((message, id) => (
              <Message
                key={message.id}
                lastMessageRef={id === 0 ? lastMessageRef : null}
                ref={dropdownRef}
                message={message}
                onClick={() => handlePressMore(message)}
              />
            ))}
          </ul>
          {!messages ||
            messages.length > 0 ||
            (shouldFetchMoreMessages && (
              <div className="flex w-full items-center justify-center py-4">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
              </div>
            ))}
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
      )}
    </div>
  );
};

export default Chat;
