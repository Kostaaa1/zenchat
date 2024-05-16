import { FC, MutableRefObject, RefObject } from "react";
import { Modal } from "./Modals";

type NotifyModalProps = {
  modalRef: MutableRefObject<HTMLDivElement>;
};

const NotifyModal: FC<NotifyModalProps> = ({ modalRef }) => {
  return (
    <Modal>
      <div
        ref={modalRef}
        className="flex h-max w-96 flex-col items-center rounded-xl bg-[#282828] px-2 py-4 pb-0 text-center"
      >
        <h4 className="py-2 text-lg">The maximum of the file is 25MB</h4>
        <div className="flex w-full flex-col pt-4 text-sm font-semibold">
          <div className="-mx-2 transition-all duration-200">
            <button
              // onClick={() => setIsNotifyModalOpen(false)}
              className="w-full cursor-pointer rounded-bl-xl rounded-br-xl p-3 text-white active:bg-neutral-800"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default NotifyModal;
