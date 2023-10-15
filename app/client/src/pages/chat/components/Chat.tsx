import React, { FC, useEffect, useRef, useState } from "react";
import Button from "../../../components/Button";
import { cn } from "../../../utils/utils";
import Avatar from "../../../components/avatar/Avatar";
import { TMessage } from "../../../../../server/src/types/types";
import { Dot, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useChatStore from "../../../utils/stores/chatStore";
import { trpc } from "../../../utils/trpcClient";
import Icon from "../../main/components/Icon";
import { debounce } from "lodash";
import useModalStore from "../../../utils/stores/modalStore";
import useOutsideClick from "../../../hooks/useOutsideClick";
import { loadImages } from "../../../utils/loadImages";
import useUser from "../../../hooks/useUser";
import RenderAvatar from "../../../components/avatar/RenderAvatar";

const List = ({ message }: { message: TMessage }) => {
  const {
    messageDropdownData,
    setMessageDropdownData,
    setShowUnsendMsgModal,
    showImageModal,
  } = useModalStore();
  const { userId } = useUser();
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const { content, id, sender_id, isImage } = message;
  const moreDropdownRef = useRef<HTMLDivElement>(null);
  useOutsideClick([moreDropdownRef], "click", () =>
    setMessageDropdownData(null),
  );

  const handleMessageDropdownData = () => {
    const imageKitPrefix = import.meta.env.VITE_IMAGEKIT_PREFIX;
    const imageUrl = isImage ? content.split(imageKitPrefix)[1] : null;

    const msgData = {
      id,
      imageUrl,
    };

    setMessageDropdownData(messageDropdownData ? null : msgData);
  };

  return (
    <li
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "mt-1 flex w-full flex-row items-center justify-center break-words",
        sender_id === userId
          ? "flex-row-reverse justify-start self-start"
          : "justify-start self-start",
      )}
    >
      {isImage ? (
        <div
          onClick={() => {
            showImageModal(content);
          }}
          className={cn(
            "relative h-full max-h-[400px] w-full max-w-[230px] cursor-pointer rounded-2xl",
          )}
        >
          <div className="absolute z-10 h-full w-full rounded-2xl transition-all duration-150 hover:bg-white hover:bg-opacity-10"></div>
          {content.split("blob").length > 1 ? (
            <img className="rounded-2xl" src={content} />
          ) : (
            <img className="rounded-2xl" src={content} />
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <div
            className={cn(
              "max-w-[300px] px-2 py-1",
              sender_id === userId
                ? "rounded-xl bg-[#356ed0]"
                : "rounded-xl bg-neutral-700",
            )}
          >
            {content}
          </div>
        </div>
      )}
      {messageDropdownData?.id === id || isHovered ? (
        <div
          ref={moreDropdownRef}
          className={cn(
            "relative flex w-14 cursor-pointer justify-around text-neutral-400",
            sender_id === userId ? "flex-row-reverse" : "",
          )}
        >
          <Icon name="Smile" size="18px" className="hover:text-white" />
          <Icon
            name="MoreHorizontal"
            size="18px"
            className="hover:text-white"
            onClick={handleMessageDropdownData}
          />
          {messageDropdownData?.id === id ? (
            <div
              className={cn(
                "absolute bottom-5 z-[100] flex h-max w-max select-none items-center justify-between rounded-sm bg-black p-2",
                sender_id === userId ? "right-16" : "left-16",
              )}
            >
              {sender_id === userId ? (
                <p
                  onClick={() => setShowUnsendMsgModal(true)}
                  className="mr-2 text-sm font-semibold text-white transition-colors duration-150 hover:text-neutral-200"
                >
                  Unsend
                </p>
              ) : null}
              <p
                onClick={() => {
                  navigator.clipboard.writeText(content);
                  setMessageDropdownData(null);
                }}
                className="text-sm font-semibold text-white transition-colors duration-150 hover:text-neutral-200"
              >
                Copy
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </li>
  );
};

type ChatProps = {
  scrollRef: React.RefObject<HTMLDivElement>;
  chatRoomId: string;
};

const Chat: FC<ChatProps> = ({ chatRoomId, scrollRef }) => {
  const navigate = useNavigate();
  const {
    shouldFetchMoreMessages,
    setShouldFetchMoreMessages,
    // currentChatroom,
    setIsMessagesLoading,
    isMessagesLoading,
  } = useChatStore();
  const [lastMessageDate, setLastMessageDate] = useState<string>("");
  const { typingUser } = useChatStore();
  const { userData, userId } = useUser();
  const ctx = trpc.useContext();

  const currentChatroom = ctx.chat.getCurrentChatroom.getData({
    chatroom_id: chatRoomId,
    user_id: userId,
  });

  const { mutateAsync: getMoreMutation, isSuccess } =
    trpc.chat.messages.getMore.useMutation({
      mutationKey: [
        {
          chatroom_id: chatRoomId as string,
        },
      ],
      onSuccess: (messages) => {
        if (!messages || !shouldFetchMoreMessages) return;
        console.log("Fetched messages", messages);
        ctx.chat.messages.get.setData(
          {
            chatroom_id: chatRoomId,
          },
          (staleChats) => {
            if (staleChats && messages) {
              return [...staleChats, ...messages];
            }
          },
        );
        if (messages.length <= 22) setShouldFetchMoreMessages(false);
      },
    });

  const { data: messages } = trpc.chat.messages.get.useQuery(
    { chatroom_id: chatRoomId as string },
    { enabled: !!chatRoomId },
  );

  const fetchLoadedImages = async (messages: TMessage[]) => {
    try {
      const loadedImages = await loadImages(messages);
      ctx.chat.messages.get.setData(
        { chatroom_id: chatRoomId as string },
        loadedImages,
      );
    } catch (error) {
      console.log(error);
    } finally {
      if (messages.length <= 22) setShouldFetchMoreMessages(false);
      setIsMessagesLoading(false);
    }
  };

  useEffect(() => {
    if (messages) {
      fetchLoadedImages(messages);

      if (messages.length > 0)
        setLastMessageDate(messages[messages.length - 1].created_at);
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

  useEffect(() => {
    console.log("currentChatroom", currentChatroom);
  }, [currentChatroom]);

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
              {typingUser !== userData?.id && typingUser.length > 0 ? (
                <div className="typing-indicator">
                  <div className="message-cloud rounded-2xl bg-slate-300 p-2 py-3">
                    <Dot className="dot dot-1" color="#4285f4" size="8px" />
                    <Dot className="dot dot-2" color="#4285f4" size="8px" />
                    <Dot className="dot dot-3" color="#4285f4" size="8px" />
                  </div>
                </div>
              ) : null}
            </span>
            {messages?.map((message) => (
              <List key={message.id} message={message} />
            ))}
          </ul>
          {messages &&
          messages?.length > 0 &&
          shouldFetchMoreMessages &&
          !isSuccess ? (
            <div className="gw-full flex items-center justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            </div>
          ) : null}
          {!shouldFetchMoreMessages && currentChatroom ? (
            <div className="flex flex-col items-center pb-8 pt-4">
              <RenderAvatar
                image_urls={{
                  image_url_1: currentChatroom.users[0]?.image_url,
                  image_url_2: currentChatroom.users[1]?.image_url,
                }}
                avatarSize="xl"
              />
              <div className="flex flex-col items-center pt-4">
                <h3 className="text-md py-2 font-semibold">
                  {currentChatroom && currentChatroom?.users.length > 1
                    ? currentChatroom?.users.map((x) => x.username).join(", ")
                    : currentChatroom?.users[0].username}
                </h3>
                {currentChatroom?.users.length === 1 ? (
                  <Button
                    className="text-sm font-semibold"
                    onClick={() => navigate(`/${currentChatroom?.users[0]}`)}
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
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Chat;
