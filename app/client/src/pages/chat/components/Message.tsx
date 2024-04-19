import { FC, useRef, useState } from "react";
import { cn } from "../../../utils/utils";
import useUser from "../../../hooks/useUser";
import useModalStore from "../../../utils/stores/modalStore";
import { TMessage } from "../../../../../server/src/types/types";
import useOutsideClick from "../../../hooks/useOutsideClick";
import Icon from "../../main/components/Icon";

interface MessageProps {
  message: TMessage;
}

const Message: FC<MessageProps> = ({ message }) => {
  const { setMessageDropdownData, setShowUnsendMsgModal, showImageModal } =
    useModalStore((state) => state.actions);
  const messageDropdownData = useModalStore(
    (state) => state.messageDropdownData,
  );
  const { userData } = useUser();
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
        sender_id === userData!.id
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
              sender_id === userData!.id
                ? "rounded-xl bg-lightBlue"
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
            sender_id === userData!.id ? "flex-row-reverse" : "",
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
                sender_id === userData!.id ? "right-16" : "left-16",
              )}
            >
              {sender_id === userData!.id ? (
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

export default Message;
