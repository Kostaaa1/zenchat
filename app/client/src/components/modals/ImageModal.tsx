import { useRef, useState } from "react";
import Icon from "../../pages/main/components/Icon";
import { cn } from "../../utils/utils";
import useModalStore from "../../utils/stores/modalStore";
import useOutsideClick from "../../hooks/useOutsideClick";
import { Modal } from "./Modals";

const ImageModal = () => {
  const [loading, setLoading] = useState(true);
  const { closeImageModal } = useModalStore((state) => state.actions);
  const imageModalSource = useModalStore((state) => state.imageModalSource);
  const imageModalRef = useRef<HTMLDivElement>(null);
  useOutsideClick([imageModalRef], "mousedown", closeImageModal);

  return (
    <>
      {imageModalSource ? (
        <Modal>
          <div
            ref={imageModalRef}
            className={cn("relative", loading ? "hidden" : "block")}
          >
            {imageModalSource.split("blob").length > 1 ? (
              <img
                className="max-h-[620px]"
                src={imageModalSource}
                alt={imageModalSource}
                onLoad={() => setLoading(false)}
              />
            ) : (
              <img
                className="max-h-[620px]"
                src={imageModalSource}
                alt={imageModalSource}
                onLoad={() => setLoading(false)}
              />
            )}
            <div
              onClick={closeImageModal}
              className="absolute right-1 top-1 cursor-pointer rounded-full p-1 text-white transition-colors duration-200 hover:bg-white hover:bg-opacity-10"
            >
              <Icon name="X" size="28px" />
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  );
};

export default ImageModal;
