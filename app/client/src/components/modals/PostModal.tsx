import Icon from "../Icon";
import { FC, useState } from "react";
import useModalStore from "../../utils/state/modalStore";
import { Modal } from "./Modals";
import { motion } from "framer-motion";
import { trpc } from "../../utils/trpcClient";
import useUser from "../../hooks/useUser";
import { TPost } from "../../../../server/src/types/types";
import Avatar from "../avatar/Avatar";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ModalProps = {
  postData: TPost;
  modalRef: React.RefObject<HTMLDivElement>;
  leftRef?: React.RefObject<HTMLDivElement>;
  rightRef?: React.RefObject<HTMLDivElement>;
};

const PostModal: FC<ModalProps> = ({
  postData,
  modalRef,
  leftRef,
  rightRef,
}) => {
  const [showMore, setShowMore] = useState(false);
  const { media_url, type, thumbnail_url } = postData;
  const { userData } = useUser();
  const { setModalPostData } = useModalStore((state) => state.actions);
  const ctx = trpc.useUtils();
  const deletePostMutation = trpc.posts.delete.useMutation({
    onSuccess: () => {
      ctx.user.get.setData(
        { data: userData!.username, type: "username" },
        (state) => {
          if (state) {
            return {
              ...state,
              posts: state.posts.filter((x) => x.id !== postData.id),
            };
          }
        },
      );
    },
  });

  const handleDeletePost = async () => {
    try {
      const { id, media_name, thumbnail_url } = postData;
      await deletePostMutation.mutateAsync({
        id,
        postUrl: media_name,
        thumbnailUrl: thumbnail_url
          ? `thumbnail-${media_name.replace(".mp4", ".jpg")}`
          : null,
      });
      setModalPostData(null);
    } catch (error) {
      console.log("error deleting post", error);
    }
  };

  return (
    <>
      <Modal>
        <div
          ref={leftRef}
          className="absolute left-4 top-1/2 h-max w-max -translate-y-1/2 scale-125 cursor-pointer rounded-full bg-white text-black"
        >
          <ChevronLeft />
        </div>
        <div
          ref={rightRef}
          className="absolute right-4 top-1/2 h-max w-max -translate-y-1/2 scale-125 cursor-pointer rounded-full bg-white text-black"
        >
          <ChevronRight />
        </div>
        <div className="mx-auto flex max-h-[90vh] max-w-[84%]" ref={modalRef}>
          <div>
            {type.startsWith("image/") ? (
              <img src={media_url} />
            ) : type.startsWith("video/") ? (
              <video
                className="h-full w-full object-cover"
                loop
                controls
                poster={thumbnail_url ?? ""}
                autoPlay
                onLoadStart={(e) => (e.currentTarget.volume = 0.05)}
              >
                <source src={media_url} type={type} />
              </video>
            ) : (
              <></>
            )}
          </div>
          <div className="flex w-[500px] flex-col bg-black">
            <div className="relative flex items-center justify-between border-[1px] border-x-0 border-t-0 border-neutral-800 p-2">
              <div className="flex w-full items-center space-x-2">
                <Avatar image_url={userData?.image_url} size="md" />
                <h1 className="text-normal font-bold">{userData?.username}</h1>
              </div>
              <Icon
                name="MoreHorizontal"
                className="rounded-full p-1 text-white transition-colors duration-200 hover:bg-white  hover:bg-opacity-20"
                onClick={() => setShowMore((state) => !state)}
                size="30px"
              />
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
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PostModal;
