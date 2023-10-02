import useModalStore from "../utils/stores/modalStore";
import ImageModal from "./ImageModal";
import UnsendMsgModal from "./UnsendMsgModal";

const Modals = () => {
  const { isImageModalOpen, imageModalSource, showUnsendMsgModal } =
    useModalStore();

  return (
    <>
      {isImageModalOpen && imageModalSource ? <ImageModal /> : null}
      {showUnsendMsgModal ? <UnsendMsgModal /> : null}
    </>
  );
};

export default Modals;
