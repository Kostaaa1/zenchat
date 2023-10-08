import useModalStore from "../utils/stores/modalStore";
import ImageModal from "./ImageModal";
import SendMessageModal from "./SendMessageModal";
import UnsendMsgModal from "./UnsendMsgModal";

const Modals = () => {
  const {
    isSendMessageModalActive,
    isImageModalOpen,
    imageModalSource,
    showUnsendMsgModal,
  } = useModalStore();

  return (
    <>
      {isImageModalOpen && imageModalSource ? <ImageModal /> : null}
      {showUnsendMsgModal ? <UnsendMsgModal /> : null}
      {isSendMessageModalActive ? <SendMessageModal /> : null}
    </>
  );
};

export default Modals;
