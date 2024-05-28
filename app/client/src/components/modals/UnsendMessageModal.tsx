import { forwardRef } from "react";
import useModalStore from "../../lib/stores/modalStore";
import useChatCache from "../../hooks/useChatCache";
import useChatStore from "../../lib/stores/chatStore";
import { trpc } from "../../lib/trpcClient";
import { Modal } from "./Modals";

const UnsendMessageModal = forwardRef<HTMLDivElement>((_, ref) => {
  const { closeModal } = useModalStore((state) => state.actions);
  const unsendMsgData = useModalStore((state) => state.unsendMsgData);
  const activeChatroom = useChatStore((state) => state.activeChatroom);
  const { removeMessageCache } = useChatCache();
  const unsendMessageMutation = trpc.chat.messages.unsend.useMutation();

  const handleConfirmUnsend = async () => {
    console.log(unsendMsgData);
    // if (unsendMsgData && activeChatroom) {
    //   const {id, content, is_image} =unsendMsgData
    //   removeMessageCache(unsendMsgData.id, activeChatroom.chatroom_id);
    //   closeModal();
    //   await unsendMessageMutation.mutateAsync({id, imageUrl: is_image ? content : null});
    // }
  };

  return (
    <Modal>
      <div
        ref={ref}
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
              onClick={handleConfirmUnsend}
              className="w-full cursor-pointer border border-x-0 border-neutral-600 p-3 text-red-500 hover:text-opacity-80"
            >
              Unsend
            </button>
          </div>
          <button
            onClick={closeModal}
            className="w-full cursor-pointer border border-x-0 border-b-0 border-t-0 border-neutral-600 p-3 hover:text-neutral-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
});

export default UnsendMessageModal;
