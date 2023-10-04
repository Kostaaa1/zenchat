import { useRef } from "react";
import useModalStore from "../utils/stores/modalStore";
import useOutsideClick from "../hooks/useOutsideClick";
import { trpcVanilla } from "../utils/trpcClient";
import useChatStore from "../utils/stores/chatStore";
import useChat from "../hooks/useChat";
import { useParams } from "react-router-dom";

const UnsendMsgModal = () => {
  const { closeImageModal, setShowUnsendMsgModal, messageDropdownData } =
    useModalStore();
  const unsendMsgModal = useRef<HTMLDivElement>(null);
  useOutsideClick([unsendMsgModal], "mousedown", closeImageModal);
  const { currentChatroom } = useChatStore();
  const params = useParams<{ chatRoomId: string }>();
  const { removeMessageCache } = useChat();

  const handleUnsendMessage = () => {
    if (messageDropdownData && currentChatroom) {
      removeMessageCache(messageDropdownData.id, currentChatroom.chatroom_id);
      setShowUnsendMsgModal(false);
      trpcVanilla.chat.messages.unsend.mutate(messageDropdownData);
    }
  };

  return (
    <div className="absolute z-[1000] flex h-full w-screen items-center justify-center overflow-hidden bg-black bg-opacity-70">
      <div
        ref={unsendMsgModal}
        className="flex h-max w-96 flex-col items-center rounded-xl bg-[#333333] px-2 py-4 pb-0 text-center"
      >
        <h4 className="py-2 text-xl">Unsend message?</h4>
        <p className="text-sm leading-4 text-neutral-400">
          This will remove the message for everyone but people may have seen it
          already.
        </p>
        <div className="flex w-full flex-col pt-4 text-sm font-semibold">
          <div className="-mx-2 transition-colors duration-200">
            <button
              onClick={handleUnsendMessage}
              className="w-full cursor-pointer border border-x-0 border-neutral-600 p-3 text-red-500 hover:text-opacity-80"
            >
              Unsend
            </button>
          </div>
          <button
            onClick={() => setShowUnsendMsgModal(false)}
            className="w-full cursor-pointer border border-x-0 border-b-0 border-t-0 border-neutral-600 p-3 hover:text-neutral-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnsendMsgModal;
