import React, { FC, useEffect, useState } from "react";
import Button from "../../../components/Button";
import { TMessage } from "../../../../../server/src/types/types";
import { Dot, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useChatStore from "../../../utils/stores/chatStore";
import { trpc } from "../../../utils/trpcClient";
import { debounce } from "lodash";
import { loadImagesAndStructureMessages } from "../../../utils/loadImages";
import useUser from "../../../hooks/useUser";
import RenderAvatar from "../../../components/avatar/RenderAvatar";
import Message from "./Message";

type ChatProps = {
  scrollRef: React.RefObject<HTMLDivElement>;
  chatRoomId: string;
};

const Chat: FC<ChatProps> = ({ chatRoomId, scrollRef }) => {
  const MESSAGE_FETCH_LIMIT = 22;
  const navigate = useNavigate();
  const [lastMessageDate, setLastMessageDate] = useState<string>("");
  const currentChatroom = useChatStore((state) => state.currentChatroom);
  const currentChatroomTitle = useChatStore(
    (state) => state.currentChatroomTitle,
  );
  const typingUser = useChatStore((state) => state.typingUser);
  const { userData } = useUser();
  const ctx = trpc.useUtils();
  const isMessagesLoading = useChatStore((state) => state.isMessagesLoading);
  const shouldFetchMoreMessages = useChatStore(
    (state) => state.shouldFetchMoreMessages,
  );
  const { setShouldFetchMoreMessages, setIsMessagesLoading } = useChatStore(
    (state) => state.actions,
  );
  const { mutateAsync: getMoreMutation, isSuccess } =
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

  const fetchLoadedImages = async (messages: TMessage[]) => {
    try {
      const loadedImages = await loadImagesAndStructureMessages(messages);
      ctx.chat.messages.get.setData(
        { chatroom_id: chatRoomId as string },
        loadedImages,
      );
    } catch (error) {
      console.log(error);
    } finally {
      setIsMessagesLoading(false);
    }
  };

  useEffect(() => {
    if (messages) {
      fetchLoadedImages(messages);
      if (messages.length < MESSAGE_FETCH_LIMIT)
        setShouldFetchMoreMessages(false);
      if (messages.length > 0) {
        setLastMessageDate(messages[messages.length - 1].created_at);
      }
    }
  }, [messages]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const handleScroll = debounce(() => {
      const { scrollTop, clientHeight, scrollHeight } = container;
      const scrollTolerance = 1;
      if (
        Math.abs(scrollTop) >= scrollHeight - clientHeight - scrollTolerance &&
        shouldFetchMoreMessages
      ) {
        getMoreMutation({
          chatroom_id: chatRoomId,
          lastMessageDate: lastMessageDate,
        });
      }
    }, 250);
    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      handleScroll.cancel();
    };
  });

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {isMessagesLoading ? (
        <div className="flex w-full items-center justify-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex h-full flex-col-reverse justify-between overflow-y-auto overflow-x-hidden"
        >
          <ul className="flex flex-col-reverse p-3">
            <span>
              {/* {typingUser.length > 0 && (
                <span className="absolute bottom-[72px] left-4 text-sm font-semibold text-neutral-500">
                  {typingUser} is typing...
                </span>
              )} */}
            </span>
            {messages?.map((message) => (
              <Message key={message.id} message={message} />
            ))}
          </ul>
          {messages &&
            messages?.length > 0 &&
            shouldFetchMoreMessages &&
            !isSuccess && (
              <div className="flex w-full items-center justify-center py-4">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
              </div>
            )}
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
