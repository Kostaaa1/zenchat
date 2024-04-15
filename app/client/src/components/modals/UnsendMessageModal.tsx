import { useRef } from "react";
import useModalStore from "../../utils/stores/modalStore";
import useOutsideClick from "../../hooks/useOutsideClick";
import useChatCache from "../../hooks/useChatCache";
import useChatStore from "../../utils/stores/chatStore";
import { trpc } from "../../utils/trpcClient";

const UnsendMessageModal = () => {
  const { setShowUnsendMsgModal } = useModalStore((state) => state.actions);
  const messageDropdownData = useModalStore(
    (state) => state.messageDropdownData,
  );
  const currentChatroom = useChatStore((state) => state.currentChatroom);
  const { removeMessageCache } = useChatCache();
  const unsendMsgModalRef = useRef<HTMLDivElement>(null);
  const unsendMessageMutation = trpc.chat.messages.unsend.useMutation();

  useOutsideClick([unsendMsgModalRef], "mousedown", () =>
    setShowUnsendMsgModal(false),
  );

  const handleUnsendMessage = async () => {
    if (messageDropdownData && currentChatroom) {
      removeMessageCache(messageDropdownData.id, currentChatroom.chatroom_id);
      setShowUnsendMsgModal(false);
      await unsendMessageMutation.mutateAsync(messageDropdownData);
    }
  };

  return (
    <div className="absolute z-[1000] flex h-full w-screen items-center justify-center overflow-hidden bg-black bg-opacity-70">
      <div
        ref={unsendMsgModalRef}
        className="flex h-max w-96 flex-col items-center rounded-xl bg-[#282828] px-2 py-4 pb-0 text-center"
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

export default UnsendMessageModal;
