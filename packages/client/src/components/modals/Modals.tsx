import useModalStore from "../../stores/modalStore"
import EditProfileModal from "./EditProfileModal"
import ImageModal from "./ImageModal"
import NewMessageModal from "./NewMessageModal"
import UnsendMessageModal from "./UnsendMessageModal"
import DeleteChatModal from "./DeleteChatModal"
import DndUploadModal from "./DndUploadModal"
import React, { FC, useEffect, useRef } from "react"
import PostModal from "./PostModal"
import useOutsideClick from "../../hooks/useOutsideClick"
import ModalOptions from "./ModalOptions"
import VoiceCallModal from "./VoiceCallModal"
import { motion, AnimatePresence } from "framer-motion"
import usePeerConnectionStore from "../../stores/peerConnection"

type ModalProps = {
  children?: React.ReactNode
}

export const Modal: FC<ModalProps> = ({ children }) => {
  useEffect(() => {
    if (document.body.scrollHeight > window.innerHeight) {
      document.body.style.overflow = "hidden"
      document.body.classList.add("no-scroll-padding")
      document.querySelector("#bottomnav")?.classList.add("no-scroll-padding")
    }
  }, [])
  return (
    <motion.div
      className="fixed z-[10000] flex h-[100svh] w-screen items-center justify-center overflow-hidden bg-black bg-opacity-40"
      // initial={{ opacity: 0 }}
      // animate={{ opacity: 1 }}
      // exit={{ opacity: 0 }}
    >
      <motion.div
        // initial={{ scale: 0.8, opacity: 0 }}
        // animate={{ scale: 1, opacity: 1 }}
        // exit={{ scale: 0.8, opacity: 0 }}

        initial={{
          opacity: 0,
          scale: 0.75
        }}
        animate={{
          opacity: 1,
          scale: 1,
          transition: {
            ease: "easeOut",
            duration: 0.15
          }
        }}
        exit={{
          opacity: 0,
          scale: 0.75,
          transition: {
            ease: "easeIn",
            duration: 0.15
          }
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

const Modals = () => {
  const { closeModal } = useModalStore((state) => state.actions)
  const callInfo = usePeerConnectionStore((state) => state.callInfo)
  const { activeModal, options, imageSource, isModalOpen, modalPostData } = useModalStore((state) => ({
    options: state.options,
    modalPostData: state.modalPostData,
    imageSource: state.imageSource,
    isModalOpen: state.isModalOpen,
    activeModal: state.activeModal
  }))

  const modalRef = useRef<HTMLDivElement>(null)
  const modalOptionRef = useRef<HTMLUListElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)

  useOutsideClick([modalRef, modalOptionRef, leftRef, rightRef], "mousedown", () => {
    document.body.style.overflow = ""
    document.body.classList.remove("no-scroll-padding")
    document.querySelector("#bottomnav")?.classList.remove("no-scroll-padding")
    closeModal()
  })

  return (
    <div className="absolute left-0 top-0 w-full">
      <AnimatePresence>
        {isModalOpen && (
          <>
            {activeModal === "image" && imageSource && <ImageModal imageSource={imageSource} ref={modalRef} />}
            {activeModal === "unsendmessage" && <UnsendMessageModal ref={modalRef} />}
            {activeModal === "newmessage" && <NewMessageModal ref={modalRef} />}
            {activeModal === "editprofile" && <EditProfileModal ref={modalRef} />}
            {activeModal === "deletechat" && <DeleteChatModal ref={modalRef} />}
            {activeModal === "post" && modalPostData && (
              <PostModal post={modalPostData} ref={modalRef} leftRef={leftRef} rightRef={rightRef} />
            )}
            {activeModal === "uploadpost" && <DndUploadModal ref={modalRef} />}
            {activeModal === "voiceCall" && callInfo && <VoiceCallModal ref={modalRef} callInfo={callInfo} />}
            {options.length > 0 && <ModalOptions ref={modalOptionRef} />}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Modals
