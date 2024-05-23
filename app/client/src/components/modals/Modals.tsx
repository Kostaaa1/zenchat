import useModalStore from "../../utils/state/modalStore";
import EditProfileModal from "./EditProfileModal";
import ImageModal from "./ImageModal";
import NewMessageModal from "./NewMessageModal";
import UnsendMessageModal from "./UnsendMessageModal";
import DeleteChatModal from "./DeleteChatModal";
import DndUpload from "./DndUploadModal";
import React, { FC, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useOnClickOutside from "../../hooks/useOutsideClick";
import PostModal from "./PostModal";
import ModalOptions from "./ModalOptions";

type ModalProps = {
  children?: React.ReactNode;
};

export const Modal: FC<ModalProps> = ({ children }) => {
  return (
    <motion.div
      className="fixed z-[1000] flex h-[100svh] w-screen items-center justify-center bg-black bg-opacity-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        {" "}
        {children}
      </motion.div>
    </motion.div>
  );
};

const Modals = () => {
  const modalPostData = useModalStore((state) => state.modalPostData);
  const isModalOptionsOpen = useModalStore((state) => state.isModalOptionsOpen);
  const imageSource = useModalStore((state) => state.imageSource);
  const isModalOpen = useModalStore((state) => state.isModalOpen);
  const activeModal = useModalStore((state) => state.activeModal);
  const { closeModal } = useModalStore((state) => state.actions);

  // Arrows //
  const modalRef = useRef<HTMLDivElement>(null);
  const modalOptionRef = useRef<HTMLUListElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(
    [modalRef, modalOptionRef, leftRef, rightRef],
    "mousedown",
    () => {
      closeModal();
    },
  );

  return (
    <div className="absolute left-0 top-0 w-full">
      <AnimatePresence>
        {isModalOpen && (
          <>
            {activeModal === "image" && imageSource && (
              <ImageModal imageSource={imageSource} ref={modalRef} />
            )}
            {activeModal === "unsendmessage" && (
              <UnsendMessageModal ref={modalRef} />
            )}
            {activeModal === "newmessage" && <NewMessageModal ref={modalRef} />}
            {activeModal === "editprofile" && (
              <EditProfileModal ref={modalRef} />
            )}
            {activeModal === "deletechat" && <DeleteChatModal ref={modalRef} />}
            {activeModal === "post" && modalPostData && (
              <PostModal
                post={modalPostData}
                ref={modalRef}
                leftRef={leftRef}
                rightRef={rightRef}
              />
            )}
            {activeModal === "uploadpost" && <DndUpload ref={modalRef} />}
            {isModalOptionsOpen && modalPostData && (
              <ModalOptions ref={modalOptionRef} />
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Modals;
