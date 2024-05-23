import React, { FC, useEffect, useRef, useState } from "react";
import Button from "../../../components/Button";
import { TMessage } from "../../../../../server/src/types/types";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useChatStore from "../../../utils/state/chatStore";
import { trpc } from "../../../utils/trpcClient";
import { debounce } from "lodash";
import useUser from "../../../hooks/useUser";
import RenderAvatar from "../../../components/avatar/RenderAvatar";
import Message from "./Message";
import useModalStore from "../../../utils/state/modalStore";
import { loadImage } from "../../../utils/utils";
import useOutsideClick from "../../../hooks/useOutsideClick";

type ChatProps = {
  scrollRef: React.RefObject<HTMLDivElement>;
  chatRoomId: string;
};

const Chat: FC<ChatProps> = ({ chatRoomId, scrollRef }) => {
  const MESSAGE_FETCH_LIMIT = 22;
  const navigate = useNavigate();
  const [lastMessageDate, setLastMessageDate] = useState<string>("");
  const currentChatroom = useChatStore((state) => state.currentChatroom);
  const unsendMsgData = useModalStore((state) => state.unsendMsgData);
  const [loading, setLoading] = useState<boolean>(true);
  const { setUnsendMsgData } = useModalStore((state) => state.actions);
  const currentChatroomTitle = useChatStore(
    (state) => state.currentChatroomTitle,
  );
  const { userData } = useUser();
  const ctx = trpc.useUtils();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const shouldFetchMoreMessages = useChatStore(
    (state) => state.shouldFetchMoreMessages,
  );
  const {
    setShouldFetchMoreMessages,
    setCurrentChatroom,
    decrementUnreadMessagesCount,
  } = useChatStore((state) => state.actions);
  // const readMessagesMutation = trpc.chat.
  const { mutateAsync: getMoreMutation } =
    trpc.chat.messages.getMore.useMutation({
      mutationKey: [
        {
          chatroom_id: chatRoomId,
        },
      ],
      onSuccess: (messages) => {
        if (!messages || !shouldFetchMoreMessages) return;
        ctx.chat.messages.get.setData(
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

  const triggerReadMessagesMutation =
    trpc.chat.messages.triggerReadMessages.useMutation({
      onSuccess: () => {
        console.log("Triggered");
        decrementUnreadMessagesCount();
      },
      onError: (err) => {
        console.log("error", err);
      },
    });

  useOutsideClick([dropdownRef], "mousedown", () => {
    setUnsendMsgData(null);
  });

  useEffect(() => {
    return () => {
      console.log("Unmounting, setting current chatroom to null.");
      setCurrentChatroom(null);
    };
  }, []);

  useEffect(() => {
    // console.log("currentChatroom", currentChatroom);
    if (currentChatroom && userData) {
      const foundUser = currentChatroom.users.find(
        (x) => x.user_id === userData.id,
      );
      if (foundUser && !foundUser.is_message_seen)
        triggerReadMessagesMutation.mutate(userData.id);
    }
  }, [currentChatroom]);

  const loadImagesAndPrep = async (messages: TMessage[]) => {
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
    loadImagesAndPrep(msgImgs);

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
    const handleScroll = debounce(() => {
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
    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      handleScroll.cancel();
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
    <div className="flex h-full flex-col overflow-hidden">
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
            {messages?.map((message) => (
              <Message
                key={message.id}
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
          {!shouldFetchMoreMessages && currentChatroom && (
            <div className="flex flex-col items-center pb-8 pt-4">
              <RenderAvatar
                avatarSize="xl"
                image_urls={
                  currentChatroom.is_group
                    ? {
                        image_url_1: currentChatroom.users[0]?.image_url,
                        image_url_2: currentChatroom.users[1]?.image_url,
                      }
                    : {
                        image_url_1: currentChatroom.users.find(
                          (x) => x.user_id !== userData?.id,
                        )?.image_url,
                      }
                }
              />
              <div className="flex flex-col items-center pt-4">
                <h3 className="text-md py-1 font-semibold">
                  {currentChatroom && currentChatroom?.users.length > 1
                    ? currentChatroomTitle
                    : currentChatroom?.users[0].username}
                </h3>
                {!currentChatroom?.is_group ? (
                  <Button
                    size="sm"
                    className="text-sm font-semibold"
                    onClick={() =>
                      navigate(`/${currentChatroom?.users[0].username}`)
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
