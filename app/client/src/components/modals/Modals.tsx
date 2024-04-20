import useModalStore from "../../utils/stores/modalStore";
import EditProfileModal from "./EditProfileModal";
import ImageModal from "./ImageModal";
import CreateGroupChatModal from "./CreateGroupChatModal";
import UnsendMessageModal from "./UnsendMessageModal";
import DeleteChatModal from "./DeleteChatModal";
import DndUpload from "./DndUpload";
import { FC, useEffect, useState } from "react";
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
  const { setIsModalOpen } = useModalStore((state) => state.actions);
  const isCreateGroupChatModalOpen = useModalStore(
    (state) => state.isCreateGroupChatModalOpen,
  );
  const isEditProfileModalOpen = useModalStore(
    (state) => state.isEditProfileModalOpen,
  );
  const isDndUploadModalOpen = useModalStore(
    (state) => state.isDndUploadModalOpen,
  );

  useEffect(() => {
    const arr = [
      isImageModalOpen,
      showUnsendMsgModal,
      isCreateGroupChatModalOpen,
      isEditProfileModalOpen,
      isDeleteChatOpen,
      isDndUploadModalOpen,
    ];
    const condition = arr.every((x) => !x);
    setIsModalOpen(condition);
    // const body = document.querySelector("body");
    // !condition
    //   ? body?.classList.add("no-scroll-padding")
    //   : body?.classList.remove("no-scroll-padding");
  }, [
    isImageModalOpen,
    showUnsendMsgModal,
    isCreateGroupChatModalOpen,
    isEditProfileModalOpen,
    isDeleteChatOpen,
    isDndUploadModalOpen,
    setIsModalOpen,
  ]);

  return (
    <>
      {isImageModalOpen && imageModalSource && <ImageModal />}
      {showUnsendMsgModal && <UnsendMessageModal />}
      {isCreateGroupChatModalOpen && <CreateGroupChatModal />}
      {isEditProfileModalOpen && <EditProfileModal />}
      {isDeleteChatOpen && <DeleteChatModal />}
      {isDndUploadModalOpen && <DndUpload />}
    </>
  );
};

export default Modals;
