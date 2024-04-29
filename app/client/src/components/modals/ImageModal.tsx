import { FC, useState } from "react";
import Icon from "../../pages/main/components/Icon";
import useModalStore from "../../utils/stores/modalStore";
import { Modal } from "./Modals";
import { motion } from "framer-motion";
import { trpc } from "../../utils/trpcClient";
import useUser from "../../hooks/useUser";

type ModalProps = {
  modalRef: React.RefObject<HTMLDivElement>;
};

const ImageModal: FC<ModalProps> = ({ modalRef }) => {
  const [showMore, setShowMore] = useState(false);
  const imageModalSource = useModalStore((state) => state.imageModalSource);
  const { userData } = useUser();
  const modalPostData = useModalStore((state) => state.modalPostData);
  const ctx = trpc.useUtils();
  const deletePostMutation = trpc.posts.delete.useMutation({
    onSuccess: () => {
      ctx.user.get.setData(
        { data: userData!.username, type: "username" },
        (state) => {
          if (state) {
            return {
              ...state,
              posts: state.posts.filter((x) => x.id !== modalPostData!.id),
            };
          }
        },
      );
    },
  });

  const handleDeletePost = async () => {
    try {
      if (!modalPostData) return;
      await deletePostMutation.mutateAsync(modalPostData.id);
    } catch (error) {
      console.log("error deleting post", error);
    }
  };

  return (
    <>
      {imageModalSource ? (
        <Modal>
          <div ref={modalRef} className="relative flex select-none">
            {imageModalSource.split("blob").length > 1 ? (
              <img
                src={imageModalSource}
                alt={imageModalSource}
                className="max-h-[580px] max-w-[880px]"
              />
            ) : (
              <img
                src={imageModalSource}
                alt={imageModalSource}
                className="max-h-[580px] max-w-[880px]"
              />
            )}
            {showMore && (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="absolute right-0 top-10 flex h-max w-40 flex-col rounded-xl bg-neutral-700 p-1"
              >
                <li
                  onClick={handleDeletePost}
                  className="flex cursor-pointer items-center space-x-2 rounded-xl p-2 py-1 transition-colors duration-100 hover:bg-white hover:bg-opacity-10"
                >
                  <span>Delete</span>
                </li>
              </motion.div>
            )}
            {modalPostData && (
              <>
                <div
                  onClick={() => setShowMore((state) => !state)}
                  className="absolute right-1 top-1 flex cursor-pointer -space-x-5 rounded-full p-1 text-white transition-colors duration-200 hover:bg-white hover:bg-opacity-10"
                >
                  <Icon name="Dot" size="28px" />
                  <Icon name="Dot" size="28px" />
                  <Icon name="Dot" size="28px" />
                </div>
                <div className="absolute bottom-0 inline-flex h-72 w-full items-end bg-gradient-to-t from-black to-transparent p-2 py-4">
                  <p> {modalPostData.caption}</p>
                </div>
              </>
            )}
          </div>
          {/* <div
            onClick={closeImageModal}
            className="absolute right-1 top-1 cursor-pointer rounded-full p-1 text-white transition-colors duration-200 hover:bg-white hover:bg-opacity-10"
          >
            <Icon name="X" size="28px" />
          </div> */}
        </Modal>
      ) : null}
    </>
  );
};

export default ImageModal;
