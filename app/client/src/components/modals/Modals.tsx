import useModalStore from "../../utils/stores/modalStore";
import EditProfileModal from "./EditProfileModal";
import ImageModal from "./ImageModal";
import NewMessageModal from "./NewMessageModal";
import UnsendMessageModal from "./UnsendMessageModal";
import DeleteChatModal from "./DeleteChatModal";
import DndUpload from "./DndUploadModal";
import React, { FC, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useOnClickOutside from "../../hooks/useOutsideClick";

type ModalProps = {
  children?: React.ReactNode;
};

export const Modal: FC<ModalProps> = ({ children }) => {
  return (
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
  const { closeAllModals } = useModalStore((state) => state.actions);

  // Refs:
  const newMessageModalRef = useRef<HTMLDivElement>(null);
  const imageModalRef = useRef<HTMLDivElement>(null);
  const uploadModalRef = useRef<HTMLDivElement>(null);
  const deleteChatModalRef = useRef<HTMLDivElement>(null);
  const editProfileModalRef = useRef<HTMLFormElement>(null);
  const unsendMessageModalRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(
    [
      newMessageModalRef,
      imageModalRef,
      deleteChatModalRef,
      editProfileModalRef,
      unsendMessageModalRef,
      // uploadModalRef,
    ],
    "mousedown",
    () => {
      closeAllModals();
    },
  );

  return (
    <AnimatePresence>
      {isImageModalOpen && imageModalSource && (
        <ImageModal modalRef={imageModalRef} />
      )}
      {showUnsendMsgModal && (
        <UnsendMessageModal modalRef={unsendMessageModalRef} />
      )}
      {isNewMessageModalOpen && (
        <NewMessageModal modalRef={newMessageModalRef} />
      )}
      {isEditProfileModalOpen && (
        <EditProfileModal modalRef={editProfileModalRef} />
      )}
      {isDeleteChatOpen && <DeleteChatModal modalRef={deleteChatModalRef} />}
      {isDndUploadModalOpen && <DndUpload modalRef={uploadModalRef} />}
    </AnimatePresence>
  );
};

export default Modals;
