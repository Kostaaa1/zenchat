import useModalStore from "../../stores/modalStore";
import EditProfileModal from "./EditProfileModal";
import ImageModal from "./ImageModal";
import NewMessageModal from "./NewMessageModal";
import UnsendMessageModal from "./UnsendMessageModal";
import DeleteChatModal from "./DeleteChatModal";
import DndUpload from "./DndUploadModal";
import React, { FC, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PostModal from "./PostModal";
import ModalOptions from "./ModalOptions";
import VoiceCallModal from "./VoiceCallModal";

type ModalProps = {
  children?: React.ReactNode;
};

export const Modal: FC<ModalProps> = ({ children }) => {
  useEffect(() => {
    if (document.body.scrollHeight > window.innerHeight) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("no-scroll-padding");
      document.querySelector("#bottomnav")?.classList.add("no-scroll-padding");
    }
  }, []);

  return (
    <motion.div
      className="fixed z-[10000] flex h-[100svh] w-screen items-center justify-center bg-black bg-opacity-40"
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
  // const { closeModal } = useModalStore((state) => state.actions);
  const {
    callerInfo,
    activeModal,
    imageSource,
    isModalOpen,
    isModalOptionsOpen,
    modalPostData,
  } = useModalStore((state) => ({
    modalPostData: state.modalPostData,
    isModalOptionsOpen: state.isModalOptionsOpen,
    imageSource: state.imageSource,
    isModalOpen: state.isModalOpen,
    activeModal: state.activeModal,
    callerInfo: state.callerInfo,
  }));

  // Arrows //
  const modalRef = useRef<HTMLDivElement>(null);
  const modalOptionRef = useRef<HTMLUListElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  // useOnClickOutside(
  //   [modalRef, modalOptionRef, leftRef, rightRef],
  //   "mousedown",
  //   () => {
  //     document.body.style.overflow = "";
  //     document.body.classList.remove("no-scroll-padding");
  //     document
  //       .querySelector("#bottomnav")
  //       ?.classList.remove("no-scroll-padding");
  //     closeModal();
  //   },
  // );

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
            {activeModal === "voiceCall" && callerInfo && (
              <VoiceCallModal callerInfo={callerInfo} />
            )}
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
