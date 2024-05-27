import { forwardRef, useEffect, useState } from "react";
import { cn, convertAndFormatDate } from "../../../utils/utils";
import useUser from "../../../hooks/useUser";
import useModalStore from "../../../utils/state/modalStore";
import { TMessage } from "../../../../../server/src/types/types";
import Icon from "../../../components/Icon";
import { motion } from "framer-motion";
import { Separator } from "../../dashboard/Dashboard";
import Avatar from "../../../components/avatar/Avatar";
import useChatStore from "../../../utils/state/chatStore";

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
    const unsendMsgData = useModalStore((state) => state.unsendMsgData);
    const { content, created_at, id, sender_id, is_image } = message;
    const activeChatroom = useChatStore((state) => state.activeChatroom);
    const isLoggedUserASender = sender_id === userData?.id;
    const { setImageSource, openModal, setUnsendMsgData } = useModalStore(
      (state) => state.actions,
    );

    return (
      <li
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "mt-1 flex w-full flex-row items-center justify-center break-words",
          isLoggedUserASender
            ? "flex-row-reverse justify-start self-start"
            : "justify-start self-start",
        )}
      >
        {is_image ? (
          <div
            onClick={() => {
              openModal("image");
              setImageSource(content);
            }}
            className={cn(
              "relative h-full max-h-[400px] w-full max-w-[230px] cursor-pointer rounded-2xl",
              !isLoggedUserASender && "ml-9",
            )}
          >
            <div className="absolute h-full w-full rounded-2xl transition-all duration-150 hover:bg-white hover:bg-opacity-10"></div>
            <img className="rounded-2xl" src={content} />
          </div>
        ) : (
          <div className="flex items-center justify-center">
            {rounded2 && !isLoggedUserASender && (
              <Avatar
                size="sm"
                image_url={
                  activeChatroom?.users.find((x) => x.user_id === sender_id)
                    ?.image_url
                }
              />
            )}
            <div
              className={cn(
                "max-w-[300px] rounded-[3px] px-2 py-1",
                isLoggedUserASender
                  ? " rounded-l-3xl bg-lightBlue pl-3"
                  : "ml-9 rounded-r-3xl bg-neutral-700 pr-3",
                rounded1 && "rounded-t-3xl",
                rounded2 && "ml-2 rounded-b-3xl",
              )}
            >
              {content}
            </div>
          </div>
        )}
        {unsendMsgData?.id === id || isHovered ? (
          <div
            ref={ref}
            className={cn(
              "relative flex w-max cursor-pointer justify-between space-x-2 px-1 text-neutral-400",
              isLoggedUserASender ? "flex-row-reverse" : "",
            )}
          >
            <Icon
              name="MoreHorizontal"
              size="18px"
              onClick={onClick}
              className={cn(
                "absolute z-[1000] -translate-y-1/2 rotate-90 hover:text-white",
                isLoggedUserASender ? "right-0" : "left-0",
              )}
            />
            {unsendMsgData?.id === id ? (
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
                      setUnsendMsgData(message);
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
