import { FC } from "react";
import useModalStore from "../../utils/state/modalStore";
import { TPost } from "../../../../server/src/types/types";

type PostProps = {
  post: TPost;
  onClick?: () => void;
};

const Post: FC<PostProps> = ({ post, onClick }) => {
  const { media_url, type, id } = post;
  const { setModalPostData } = useModalStore((state) => state.actions);

  return (
    <li
      className="relative max-h-[300px] cursor-pointer select-none"
      onClick={onClick}
      // onClick={() => setModalPostData(post)}
    >
      <div className="h-full">
        {/* <MediaDisplay id={id} src={media_url} type={type} autoPlay={false} /> */}
        {type.startsWith("image/") ? (
          <img src={media_url} alt={id} />
        ) : type.startsWith("video/") ? (
          <video className="aspect-video h-full object-cover" muted>
            <source src={media_url} type={type} />
          </video>
        ) : (
          <></>
        )}
      </div>
      <div className="group absolute top-0 h-full w-full bg-black bg-opacity-0 transition-colors hover:bg-opacity-20"></div>
    </li>
  );
};

export default Post;
