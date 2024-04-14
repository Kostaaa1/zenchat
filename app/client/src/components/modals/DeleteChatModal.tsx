import { useRef } from "react";
import useOutsideClick from "../../hooks/useOutsideClick";
import useModalStore from "../../utils/stores/modalStore";
import useChatStore from "../../utils/stores/chatStore";
import useChatCache from "../../hooks/useChatCache";
import { trpc } from "../../utils/trpcClient";

const DeleteChatModal = () => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { currentChatroom } = useChatStore();
  const { setIsDeleteChatOpen } = useModalStore(state => state.actions);
  const { removeChatFromUserChats } = useChatCache();
  const deleteChatMutation = trpc.chat.delete.useMutation();
  useOutsideClick([modalRef], "mousedown", () => setIsDeleteChatOpen(false));

  const handleDeleteConversation = async () => {
    if (!currentChatroom) return;
    const { chatroom_id } = currentChatroom;

    setIsDeleteChatOpen(false);
    removeChatFromUserChats(chatroom_id);
    await deleteChatMutation.mutateAsync(chatroom_id);
  };

  return (
    <div className="absolute z-[1000] flex h-full w-screen items-center justify-center overflow-hidden bg-black bg-opacity-70">
      <div
        ref={modalRef}
        className="flex h-max w-96 flex-col items-center rounded-xl bg-[#2d2d2d] px-2 py-4 pb-0 text-center"
      >
        <h4 className="py-2 text-lg">Permantly delete conversation?</h4>
        <div className="flex w-full flex-col pt-4 text-sm font-semibold">
          <div className="-mx-2 transition-all duration-200">
            <button
              onClick={handleDeleteConversation}
              className="w-full cursor-pointer border border-x-0 border-neutral-600 p-3 text-red-500 hover:text-red-400 active:bg-neutral-800"
            >
              Delete
            </button>
            <button
              onClick={() => setIsDeleteChatOpen(false)}
              className="w-full cursor-pointer rounded-bl-xl rounded-br-xl p-3 text-white active:bg-neutral-800"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteChatModal;
