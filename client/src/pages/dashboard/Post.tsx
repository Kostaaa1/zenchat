import { FC } from "react";
import useModalStore from "../../utils/state/modalStore";

type PostProps = {
  post: {
    caption: string;
    created_at: string;
    id: string;
    media_name: string;
    media_url: string;
    user_id: string;
  };
};

const Post: FC<PostProps> = ({ post }) => {
  const { showImageModal, setModalPostData } = useModalStore(
    (state) => state.actions,
  );

  const openModel = () => {
    showImageModal(post.media_url);
    setModalPostData(post);
  };

  return (
    <div className="relative cursor-pointer select-none" onClick={openModel}>
      <img src={post.media_url} alt={post.id} />
      <div className="group absolute top-0 h-full w-full bg-black bg-opacity-0 transition-colors hover:bg-opacity-50">
        <p className="absolute top-0 inline-flex h-full w-full items-end justify-start pb-2 pl-2 opacity-0 transition-opacity group-hover:opacity-100">
          {post.caption}
        </p>
      </div>
    </div>
  );
};

export default Post;
