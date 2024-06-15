import { forwardRef, useState } from "react";
import { cn } from "../../../utils/utils";
import { convertAndFormatDate } from "../../../utils/date";
import useUser from "../../../hooks/useUser";
import useModalStore from "../../../stores/modalStore";
import { TMessage } from "../../../../../server/src/types/types";
import Icon from "../../../components/Icon";
import { motion } from "framer-motion";
import { Separator } from "../../dashboard/Dashboard";
import Avatar from "../../../components/avatar/Avatar";
import useChatStore from "../../../stores/chatStore";

interface MessageProps {
  message: TMessage;
  onClick: () => void;
  rounded1: boolean;
  rounded2: boolean;
}

const Message = forwardRef<HTMLDivElement, MessageProps>(
  ({ message, rounded1, rounded2, onClick }, ref) => {
    const { userData } = useUser();
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const { content, created_at, id, sender_id, is_image } = message;
    const activeChatroom = useChatStore((state) => state.activeChatroom);
    const activeMessage = useModalStore((state) => state.activeMessage);
    const { setImageSource, openModal } = useModalStore(
      (state) => state.actions,
    );

    const isLoggedUserASender = sender_id === userData?.id;

    return (
      <li
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "flex w-full items-center break-words pt-1",
          isLoggedUserASender
            ? "flex-row-reverse justify-start self-start"
            : "justify-start self-start",
        )}
      >
        {is_image ? (
          <div
            className={cn(
              "relative h-full w-full min-w-52 max-w-[30%] cursor-pointer rounded-2xl",
              !isLoggedUserASender && "ml-9",
            )}
            onClick={() => {
              openModal("image");
              setImageSource(content);
            }}
          >
            <div className="absolute h-full w-full rounded-2xl transition-all duration-150 hover:bg-white hover:bg-opacity-10"></div>
            <img className="rounded-2xl" src={content} />
          </div>
        ) : (
          <div className="flex max-w-[70%] items-center justify-center break-all leading-tight">
            {rounded2 && !isLoggedUserASender && (
              <Avatar
                size="sm"
                image_url={
                  activeChatroom?.users.find((x) => x.user_id === sender_id)
                    ?.image_url
                }
              />
            )}
            <p
              className={cn(
                "rounded-[3px] px-3 py-2",
                isLoggedUserASender
                  ? "rounded-l-3xl bg-lightBlue"
                  : "ml-9 rounded-r-3xl bg-neutral-700",
                rounded1 && "rounded-t-3xl",
                rounded2 && "ml-2 rounded-b-3xl",
              )}
            >
              {content}
            </p>
          </div>
        )}
        {activeMessage?.id === id || isHovered ? (
          <div
            ref={ref}
            className={cn(
              "relative z-[10000] flex w-max cursor-pointer justify-between space-x-2 text-neutral-400",
              isLoggedUserASender ? "flex-row-reverse" : "",
            )}
          >
            <Icon
              name="MoreHorizontal"
              size="18px"
              onClick={onClick}
              className={cn(
                "absolute -translate-y-1/2 rotate-90 hover:text-white",
                isLoggedUserASender ? "right-0" : "left-0",
              )}
            />
            {activeMessage?.id === id ? (
              <motion.ul
                initial={{ y: 6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 6, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className={cn(
                  "absolute bottom-4 flex h-max w-32 select-none flex-col justify-between rounded-lg bg-neutral-700 p-2 text-sm font-medium text-white",
                  isLoggedUserASender ? "right-2" : "left-2",
                )}
              >
                <p className="text-sm text-neutral-200">
                  {convertAndFormatDate(created_at)}
                </p>
                <Separator className="my-1 bg-neutral-600" />
                {isLoggedUserASender ? (
                  <li
                    className="rounded-tl-lg rounded-tr-lg bg-white bg-opacity-0 p-1 font-normal transition-colors hover:bg-opacity-10"
                    onClick={() => {
                      openModal("unsendmessage");
                    }}
                  >
                    Unsend
                  </li>
                ) : null}
                <li
                  className="rounded-tl-lg rounded-tr-lg bg-white bg-opacity-0 p-1 font-normal transition-colors hover:bg-opacity-10"
                  onClick={() => console.log("Not working, should")}
                >
                  React
                </li>
              </motion.ul>
            ) : null}
          </div>
        ) : null}
      </li>
    );
  },
);

export default Message;
