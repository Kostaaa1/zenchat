import { forwardRef } from "react"
import useModalStore from "../../stores/modalStore"
import useChatStore from "../../stores/chatStore"
import useChatCache from "../../hooks/useChatCache"
import { trpc } from "../../lib/trpcClient"
import { Modal } from "./Modals"
import useUser from "../../hooks/useUser"

const DeleteChatModal = forwardRef<HTMLDivElement>((_, ref) => {
  const activeChatroom = useChatStore((state) => state.activeChatroom)
  const { closeModal } = useModalStore((state) => state.actions)
  const { removeChatFromUserChats } = useChatCache()
  const { userData } = useUser()
  const deleteChatMutation = trpc.chat.delete.useMutation()

  const handleDeleteConversation = async () => {
    if (!activeChatroom || !userData) return
    const { chatroom_id } = activeChatroom
    closeModal()
    removeChatFromUserChats(chatroom_id)
    await deleteChatMutation.mutateAsync({
      user_id: userData.id,
      chatroom_id
    })
  }

  return (
    <Modal>
      <div
        ref={ref}
        className="flex h-max w-96 flex-col items-center rounded-xl bg-[#282828] px-2 py-4 pb-0 text-center"
      >
        <h4 className="py-2 text-lg">Permanently delete conversation?</h4>
        <div className="flex w-full flex-col pt-4 text-sm font-semibold">
          <div className="-mx-2 transition-all duration-200">
            <button
              onClick={handleDeleteConversation}
              className="w-full cursor-pointer border border-x-0 border-neutral-600 p-3 text-red-500 hover:text-red-400 active:bg-neutral-800"
            >
              Delete
            </button>
            <button
              onClick={closeModal}
              className="w-full cursor-pointer rounded-bl-xl rounded-br-xl p-3 text-white active:bg-neutral-800"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
})

export default DeleteChatModal
