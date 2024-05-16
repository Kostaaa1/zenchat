import { forwardRef } from "react";
import { Modal } from "./Modals";

type ModalProps = {
  // modalRef: MutableRefObject<HTMLDivElement>;
  imageSource: string;
};

const ImageModal = forwardRef<HTMLDivElement, ModalProps>(
  ({ imageSource }, ref) => {
    return (
      <Modal>
        <div ref={ref} className="relative flex select-none">
          <img
            src={imageSource}
            alt={imageSource}
            className="max-h-[580px] w-[calc(100vw-40px)] max-w-xl"
          />
        </div>
      </Modal>
    );
  },
);

// const ImageModal = () => {
//   const imageSource = useModalStore((state) => state.imageSource);
//   return (
//     <>
//       {imageSource ? (
//         <Modal>
//           <div ref={modalRef} className="relative flex select-none">
//             <img
//               src={imageSource}
//               alt={imageSource}
//               className="max-h-[580px] w-[calc(100vw-40px)] max-w-xl"
//             />
//           </div>
//         </Modal>
//       ) : null}
//     </>
//   );
// };

export default ImageModal;
