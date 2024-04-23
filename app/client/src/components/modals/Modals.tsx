import useModalStore from "../../utils/stores/modalStore";
import EditProfileModal from "./EditProfileModal";
import ImageModal from "./ImageModal";
import NewMessageModal from "./NewMessageModal";
import UnsendMessageModal from "./UnsendMessageModal";
import DeleteChatModal from "./DeleteChatModal";
import DndUpload from "./DndUpload";
import { FC } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ModalProps = {
  children: React.ReactNode;
};
export const Modal: FC<ModalProps> = ({ children }) => {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed z-[1000] flex h-screen w-full items-center justify-center bg-black bg-opacity-75"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Modals = () => {
  const isImageModalOpen = useModalStore((state) => state.isImageModalOpen);
  const imageModalSource = useModalStore((state) => state.imageModalSource);
  const showUnsendMsgModal = useModalStore((state) => state.showUnsendMsgModal);
  const isDeleteChatOpen = useModalStore((state) => state.isDeleteChatOpen);
  const isNewMessageModalOpen = useModalStore(
    (state) => state.isNewMessageModalModalOpen,
  );
  const isEditProfileModalOpen = useModalStore(
    (state) => state.isEditProfileModalOpen,
  );
  const isDndUploadModalOpen = useModalStore(
    (state) => state.isDndUploadModalOpen,
  );

  return (
    <>
      {isImageModalOpen && imageModalSource && <ImageModal />}
      {showUnsendMsgModal && <UnsendMessageModal />}
      {isNewMessageModalOpen && <NewMessageModal />}
      {isEditProfileModalOpen && <EditProfileModal />}
      {isDeleteChatOpen && <DeleteChatModal />}
      {isDndUploadModalOpen && <DndUpload />}
    </>
  );
};

export default Modals;
