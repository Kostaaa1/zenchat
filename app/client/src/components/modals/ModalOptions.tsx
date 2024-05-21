import { FC, forwardRef } from "react";
import { Modal } from "./Modals";
import { cn } from "../../utils/utils";
import useModals from "./hooks/useModals";
import useModalStore from "../../utils/state/modalStore";
import { downloadImage } from "../../utils/downloadImage";
import { trpc } from "../../utils/trpcClient";

type ListProps = {
  text: string;
  onClick: () => void;
  className?: string;
};

const List: FC<ListProps> = ({ text, onClick, className }) => {
  return (
    <li
      onClick={onClick}
      className={cn(
        "w-full cursor-pointer bg-white bg-opacity-0 py-2 text-center font-semibold duration-100 hover:bg-opacity-[0.05]",
        className,
      )}
    >
      {text}
    </li>
  );
};

const ModalOptions = forwardRef<HTMLUListElement>((_, ref) => {
  const { deletePost } = useModals();
  const { modalPostData } = useModalStore();
  const utils = trpc.useUtils();
  const inspectedUser = utils.user.get.getData({
    data: location.pathname.split("/")[1],
    type: "username",
  });

  return (
    <Modal>
      <ul ref={ref} className="h-max w-[380px] rounded-lg bg-neutral-800">
        {inspectedUser?.id === modalPostData?.user_id && (
          <List
            text="Delete"
            onClick={() => deletePost()}
            className="text-red-500"
          />
        )}
        {modalPostData && (
          <List
            text="Download"
            onClick={() => downloadImage(modalPostData.media_url)}
          />
        )}
      </ul>
    </Modal>
  );
});

export default ModalOptions;
