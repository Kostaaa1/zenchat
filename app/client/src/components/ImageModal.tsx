import { useRef, useState } from "react";
import Icon from "../pages/main/components/Icon";
import { cn } from "../utils/utils";
import useModalStore from "../utils/stores/modalStore";
import useOutsideClick from "../hooks/useOutsideClick";

const ImageModal = () => {
  const [loading, setLoading] = useState(true);
  const { imageModalSource, closeImageModal } = useModalStore();
  const imageModalRef = useRef<HTMLDivElement>(null);
  useOutsideClick([imageModalRef], "mousedown", closeImageModal);

  return (
    <>
      {imageModalSource ? (
        <div className="absolute z-[1000] flex h-full w-screen items-center justify-center overflow-hidden bg-black bg-opacity-70">
          <div
            ref={imageModalRef}
            className={cn(
              "relative h-auto w-auto",
              loading ? "hidden" : "block",
            )}
          >
            {imageModalSource.split("blob").length > 1 ? (
              <img
                className="max-h-[620px] max-w-[480px]"
                src={imageModalSource}
                alt={imageModalSource}
                onLoad={() => setLoading(false)}
              />
            ) : (
              <img
                className="max-h-[620px] max-w-[480px]"
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
        </div>
      ) : null}
    </>
  );
};

export default ImageModal;
