import Icon from "../Icon";
import { FC, forwardRef } from "react";
import useModalStore from "../../lib/stores/modalStore";
import { Modal } from "./Modals";
import { trpc } from "../../lib/trpcClient";
import { TPost, TUserData } from "../../../../server/src/types/types";
import Avatar from "../avatar/Avatar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocation } from "react-router-dom";
import Video from "../Video";
import useGeneralStore from "../../lib/stores/generalStore";
import { convertAndFormatDate } from "../../utils/date";
import { cn } from "../../utils/utils";

type ModalProps = {
  post: TPost;
  leftRef?: React.RefObject<HTMLDivElement>;
  rightRef?: React.RefObject<HTMLDivElement>;
};

const ArrowCursors: FC<ModalProps & { posts: TPost[] }> = ({
  post,
  posts,
  leftRef,
  rightRef,
}) => {
  const { setModalPostData } = useModalStore((state) => state.actions);
  const navigatePost = (direction: "next" | "previous") => {
    const currentIndex = posts.findIndex(({ id }) => id === post.id);
    if (direction === "next" && currentIndex < posts.length - 1) {
      setModalPostData(posts[currentIndex + 1]);
    } else if (direction === "previous" && currentIndex > 0) {
      setModalPostData(posts[currentIndex - 1]);
    }
  };
  return (
    <>
      {posts[0].id !== post.id && (
        <div
          ref={leftRef}
          onClick={() => navigatePost("previous")}
          className="absolute -left-9 top-1/2 h-max w-max -translate-y-1/2 scale-125 cursor-pointer rounded-full bg-white text-black"
        >
          <ChevronLeft />
        </div>
      )}
      {posts[posts.length - 1].id !== post.id && (
        <div
          ref={rightRef}
          onClick={() => navigatePost("next")}
          className="absolute -right-9 top-1/2 h-max w-max -translate-y-1/2 scale-125 cursor-pointer rounded-full bg-white text-black"
        >
          <ChevronRight />
        </div>
      )}
    </>
  );
};

const PostHeader: FC<{ userData: TUserData }> = ({ userData }) => {
  const { triggerModalOptions } = useModalStore((state) => state.actions);
  return (
    <div
      className={
        "relative flex items-center justify-between rounded-t-xl border-[1px] border-x-0 border-t-0 border-neutral-800 bg-black p-3"
      }
    >
      <div className="flex w-full items-center space-x-2">
        <Avatar image_url={userData?.image_url} size="md" />
        <h3 className="text-normal cursor-pointer font-bold text-white active:text-opacity-60">
          {userData?.username}
        </h3>
      </div>
      <Icon
        name="MoreHorizontal"
        className="rounded-full p-1 text-white transition-colors duration-200 hover:bg-white  hover:bg-opacity-20"
        onClick={triggerModalOptions}
        size="30px"
      />
    </div>
  );
};

const PostComments: FC<{ post: TPost; userData: TUserData }> = ({
  post,
  userData,
}) => {
  const isMobile = useGeneralStore((state) => state.isMobile);
  return (
    <div
      className={cn(
        "flex w-full flex-col bg-black",
        isMobile ? "rounded-b-xl" : "max-w-[400px] rounded-r-xl",
      )}
    >
      {isMobile ? null : <PostHeader userData={userData} />}
      <ul
        className={cn(
          "overflow-auto p-3 text-sm leading-4",
          isMobile ? "h-[180px]" : "h-[56vw]",
        )}
      >
        <li className="flex items-start space-x-2 py-3">
          <Avatar image_url={userData.image_url} />
          <div className="flex w-full flex-col space-y-2">
            <h3 className="font-semibold text-white active:text-opacity-60">
              {userData.username} &nbsp;
            </h3>
            <div className="flex w-full flex-col space-y-1">
              <p>{post.caption}</p>
              <p className="text-neutral-400">
                {convertAndFormatDate(post.created_at)}
              </p>
            </div>
          </div>
        </li>
        {/* {Array(6)
          .fill("")
          .map((_, id) => (
            <li key={id} className="flex items-start space-x-2 py-3">
              <Avatar image_url={userData.image_url} />
              <div className="flex space-x-2">
                <p>
                  <span className="font-semibold text-white active:text-opacity-60">
                    {userData.username} &nbsp;
                  </span>
                  My comments will remain withdrawn from any discussions
                  regarding the first slide. As a leader of the council, it's
                  essential I protect my image. (Goddamn.)
                </p>
              </div>
            </li>
          ))} */}
      </ul>
    </div>
  );
};

const PostModal = forwardRef<HTMLDivElement, ModalProps>(
  ({ post, leftRef, rightRef }, ref) => {
    const location = useLocation();
    const isMobile = useGeneralStore((state) => state.isMobile);
    const utils = trpc.useUtils();
    const inspectedUser = utils.user.get.getData({
      data: location.pathname.split("/")[1],
      type: "username",
    });

    return (
      <Modal>
        {inspectedUser && post && (
          <div
            className={cn(
              "relative mx-auto flex w-full",
              isMobile
                ? "w-[80vw] max-w-[500px] flex-col"
                : "max-h-[90svh] max-w-[90vw]",
            )}
            ref={ref}
          >
            <ArrowCursors
              leftRef={leftRef}
              rightRef={rightRef}
              post={post}
              posts={inspectedUser.posts}
            />
            {isMobile ? <PostHeader userData={inspectedUser} /> : null}
            <div className="">
              {post.type.startsWith("image/") ? (
                <img key={post.media_url} src={post.media_url} />
              ) : (
                <Video
                  media_url={post.media_url}
                  controls={true}
                  autoPlay={true}
                  poster={post.thumbnail_url}
                  className={cn(
                    "h-full w-full max-w-[900px] bg-black",
                    isMobile ? "aspect-square object-cover" : "",
                  )}
                />
              )}
            </div>
            <PostComments post={post!} userData={inspectedUser} />
          </div>
        )}
      </Modal>
    );
  },
);

export default PostModal;
