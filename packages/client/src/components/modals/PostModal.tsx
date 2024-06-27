import Icon from "../Icon"
import { FC, forwardRef, useEffect, useState } from "react"
import useModalStore from "../../stores/modalStore"
import { Modal } from "./Modals"
import { trpc } from "../../lib/trpcClient"
import { TPost, TUserData } from "../../../../server/src/types/types"
import Avatar from "../avatar/Avatar"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import Video from "../Video"
import useGeneralStore from "../../stores/generalStore"
import { convertAndFormatDate } from "../../utils/date"
import { cn } from "../../utils/utils"
import useModals from "./hooks/useModals"
import useUser from "../../hooks/useUser"
import { loadImage } from "../../utils/image"

type ModalProps = {
  post: TPost
  leftRef?: React.RefObject<HTMLDivElement>
  rightRef?: React.RefObject<HTMLDivElement>
}

const ArrowCursors: FC<ModalProps & { posts: TPost[] }> = ({ post, posts, leftRef, rightRef }) => {
  const { setModalPostData } = useModalStore((state) => state.actions)
  const navigatePost = (direction: "next" | "previous") => {
    const currentIndex = posts.findIndex(({ id }) => id === post.id)
    if (direction === "next" && currentIndex < posts.length - 1) {
      setModalPostData(posts[currentIndex + 1])
    } else if (direction === "previous" && currentIndex > 0) {
      setModalPostData(posts[currentIndex - 1])
    }
  }
  return (
    <>
      {posts[0].id !== post.id && (
        <div
          ref={leftRef}
          onClick={() => navigatePost("previous")}
          className="text-neutral-700bejbek absolute left-2 top-1/2 flex h-max w-max -translate-y-1/2 cursor-pointer rounded-full bg-neutral-300 text-neutral-700"
        >
          <ChevronLeft size={32} />
        </div>
      )}
      {posts[posts.length - 1].id !== post.id && (
        <div
          ref={rightRef}
          onClick={() => navigatePost("next")}
          className="absolute right-2 top-1/2 h-max w-max -translate-y-1/2 cursor-pointer rounded-full bg-neutral-300 text-neutral-700"
        >
          <ChevronRight size={32} />
        </div>
      )}
    </>
  )
}

const PostHeader: FC<{ inspectedUser: TUserData }> = ({ inspectedUser }) => {
  const { setOptions } = useModalStore((state) => state.actions)
  const modalPostData = useModalStore((state) => state.modalPostData)
  const { deletePost } = useModals()
  const { user } = useUser()

  const opts = [
    {
      id: 0,
      child: <p>Delete</p>,
      className: "text-red-500",
      onClick: deletePost,
      condition: user?.id === modalPostData?.user_id
    },
    {
      id: 1,
      child: modalPostData ? <Link to={modalPostData?.media_url}>Download</Link> : <p></p>,
      className: "",
      onClick: deletePost,
      condition: !!modalPostData
    }
  ]

  return (
    <div
      className={
        "relative flex items-center justify-between rounded-t-xl border-[1px] border-x-0 border-t-0 border-neutral-800 bg-black p-3"
      }
    >
      <div className="flex w-full items-center space-x-2">
        <Avatar image_url={inspectedUser.image_url} size="md" />
        <h3 className="text-normal cursor-pointer font-bold text-white active:text-opacity-60">
          {inspectedUser.username}
        </h3>
      </div>
      <Icon
        name="MoreHorizontal"
        className="rounded-full p-1 text-white transition-colors duration-200 hover:bg-white  hover:bg-opacity-20"
        onClick={() => setOptions(opts)}
        size="30px"
      />
    </div>
  )
}

const PostComments: FC<{ post: TPost; inspectedUser: TUserData }> = ({ post, inspectedUser }) => {
  const isMobile = useGeneralStore((state) => state.isMobile)
  return (
    <div
      className={cn(
        "flex flex-col bg-black",
        isMobile ? "h-full max-h-[220px] w-full rounded-b-xl" : "max-h-[66vw] min-w-[420px] rounded-r-xl"
      )}
    >
      {isMobile ? null : <PostHeader inspectedUser={inspectedUser} />}
      <ul className="w-full overflow-y-auto p-3 text-sm leading-4">
        {Array(30)
          .fill("")
          .map((_, id) => (
            <li key={id} className="flex items-start space-x-2 py-3">
              <Avatar image_url={inspectedUser.image_url} />
              <div className="flex w-full flex-col space-y-2">
                <h3 className="font-semibold text-white active:text-opacity-60">{inspectedUser.username} &nbsp;</h3>
                <div className="flex w-full flex-col space-y-1">
                  <p>{post.caption}</p>
                  <p className="text-neutral-400">{convertAndFormatDate(post.created_at)}</p>
                </div>
              </div>
            </li>
          ))}
      </ul>
    </div>
  )
}

const PostModal = forwardRef<HTMLDivElement, ModalProps>(({ post, leftRef, rightRef }, ref) => {
  const location = useLocation()
  const isMobile = useGeneralStore((state) => state.isMobile)
  const utils = trpc.useUtils()
  const inspectedUser = utils.user.get.getData({
    data: location.pathname.split("/")[1],
    type: "username"
  })
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    const load = async () => {
      await loadImage(post.thumbnail_url ?? post.media_url)
      setIsLoading(true)
    }
    load()
  }, [post])

  return (
    <Modal>
      {!isLoading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <>
          <ArrowCursors leftRef={leftRef} rightRef={rightRef} post={post} posts={inspectedUser!.posts} />
          {inspectedUser && post && (
            <div
              ref={ref}
              className={cn("relative flex max-h-[95svh] w-full max-w-[78vw]", isMobile ? " flex-col" : "")}
            >
              {isMobile ? <PostHeader inspectedUser={inspectedUser} /> : null}
              <div className="bg-black">
                {post.type.startsWith("image/") ? (
                  <img
                    className={cn("w-full object-cover", isMobile ? "max-h-[420px] max-w-[60vw]" : "max-h-[66vw]")}
                    key={post.media_url}
                    src={post.media_url}
                  />
                ) : (
                  <Video
                    autoPlay={true}
                    media_url={post.media_url}
                    poster={post.thumbnail_url}
                    className={cn(
                      "aspect-square h-full w-full bg-black object-cover",
                      isMobile ? "max-h-[420px]" : "max-h-[66vw]"
                    )}
                  />
                )}
              </div>
              <PostComments post={post!} inspectedUser={inspectedUser} />
            </div>
          )}
        </>
      )}
    </Modal>
  )
})

export default PostModal
