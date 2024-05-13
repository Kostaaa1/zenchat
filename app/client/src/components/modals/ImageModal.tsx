import { FC } from "react";
import useModalStore from "../../utils/state/modalStore";
import { Modal } from "./Modals";

type ModalProps = {
  modalRef: React.RefObject<HTMLDivElement>;
};

const ImageModal: FC<ModalProps> = ({ modalRef }) => {
  const imageModalSource = useModalStore((state) => state.imageModalSource);

  return (
    <>
      {imageModalSource ? (
        <Modal>
          <div ref={modalRef} className="relative flex select-none">
            <img
              src={imageModalSource}
              alt={imageModalSource}
              className="max-h-[580px] w-[calc(100vw-40px)] max-w-xl"
            />
          </div>
        </Modal>
      ) : null}
    </>
  );
};

export default ImageModal;
