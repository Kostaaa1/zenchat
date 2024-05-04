import { FC, useRef, useState } from "react";
import { cn, convertAndFormatDate } from "../../../utils/utils";
import useUser from "../../../hooks/useUser";
import useModalStore from "../../../utils/state/modalStore";
import { TMessage } from "../../../../../server/src/types/types";
import Icon from "../../../components/Icon";
import { motion } from "framer-motion";
import List from "../../../components/List";
import { Separator } from "../../dashboard/Dashboard";

interface MessageProps {
  message: TMessage;
  onClick: () => void;
}

const Message: FC<MessageProps> = ({ message, onClick }) => {
  const { setShowUnsendMsgModal, setUnsendMsgData, showImageModal } =
    useModalStore((state) => state.actions);
  const unsendMsgData = useModalStore((state) => state.unsendMsgData);
  const { userData } = useUser();
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const { content, id, sender_id, is_image } = message;
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  return (
    <li
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "mt-1 flex w-full flex-row items-center justify-center break-words",
        sender_id === userData!.id
          ? "flex-row-reverse justify-start self-start"
          : "justify-start self-start",
      )}
    >
      {is_image ? (
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
              sender_id === userData!.id
                ? "rounded-3xl bg-lightBlue"
                : "rounded-3xl bg-neutral-800",
            )}
          >
            {content}
          </div>
        </div>
      )}
      {unsendMsgData?.id === id || isHovered ? (
        <div
          ref={moreDropdownRef}
          className={cn(
            "relative flex w-max cursor-pointer justify-between space-x-2 px-1 text-neutral-400",
            sender_id === userData!.id ? "flex-row-reverse" : "",
          )}
        >
          <Icon
            name="MoreHorizontal"
            size="18px"
            className={cn(
              "absolute -translate-y-1/2 rotate-90 hover:text-white",
              sender_id === userData!.id ? "right-1" : "left-1",
            )}
            onClick={onClick}
          />
          {unsendMsgData?.id === id ? (
            <motion.ul
              initial={{ y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 6, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className={cn(
                "absolute bottom-4 z-[100] flex h-max w-32 select-none flex-col justify-between rounded-lg bg-neutral-800 p-2 text-sm font-medium text-white",
                sender_id === userData!.id ? "-right-1" : "-left-1",
              )}
            >
              <p className="text-sm text-neutral-200">
                {convertAndFormatDate(message.created_at)}
              </p>
              <Separator className="my-1 bg-neutral-600" />
              {sender_id === userData!.id ? (
                <List
                  title="Unsend"
                  showAvatar={false}
                  className="rounded-tl-lg rounded-tr-lg p-1 font-normal"
                  onClick={() => setShowUnsendMsgModal(true)}
                />
              ) : null}
              <List
                title="Copy"
                showAvatar={false}
                className="rounded-bl-lg rounded-br-lg p-1 font-normal"
                onClick={() => {
                  navigator.clipboard.writeText(content);
                  setUnsendMsgData(null);
                }}
              />
            </motion.ul>
          ) : null}
        </div>
      ) : null}
    </li>
  );
};

export default Message;
