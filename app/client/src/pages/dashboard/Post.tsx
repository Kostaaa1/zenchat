import { FC } from "react";
import useModalStore from "../../utils/state/modalStore";
import { TPost } from "../../../../server/src/types/types";
import { Play } from "lucide-react";

type PostProps = {
  post: TPost;
};

const Post: FC<PostProps> = ({ post }) => {
  const { media_url, thumbnail_url, id } = post;
  const { setModalPostData } = useModalStore((state) => state.actions);
  const handleClick = () => {
    setModalPostData(post);
  };

  return (
    <li className="relative cursor-pointer select-none" onClick={handleClick}>
      <div className=" w-full">
        <img
          className="aspect-square"
          src={thumbnail_url ?? media_url}
          alt={id}
        />
      </div>
      {post.type.startsWith("video/") && (
        <div className="absolute right-1 top-1">
          <Play size={20} fill="white" />
        </div>
      )}
      <div className="group absolute top-0 h-full w-full bg-black bg-opacity-0 transition-colors hover:bg-opacity-20"></div>
    </li>
  );
};

export default Post;
