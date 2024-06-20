import { useCallback, useState } from "react"
import useModalStore from "../../../stores/modalStore"
import { trpc } from "../../../lib/trpcClient"
import useUser from "../../../hooks/useUser"

const useModals = () => {
  const { setModalPostData, triggerModalOptions } = useModalStore((state) => state.actions)
  const post = useModalStore((state) => state.modalPostData)
  const { user } = useUser()
  const utils = trpc.useUtils()
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const deletePostMutation = trpc.posts.delete.useMutation()

  const deletePost = useCallback(async () => {
    try {
      if (isDeleting || !post || !user) return
      setIsDeleting(true)
      const { id, media_url, thumbnail_url } = post
      const fileKeys = [media_url]
      if (thumbnail_url) fileKeys.push(thumbnail_url)

      await deletePostMutation.mutateAsync({
        id,
        fileKeys
      })

      utils.user.get.setData({ data: user.username, type: "username" }, (state) => {
        if (state) {
          return {
            ...state,
            posts: state.posts.filter((x) => x.id !== post.id)
          }
        }
      })
      triggerModalOptions()
      setModalPostData(null)
      setIsDeleting(false)
    } catch (error) {
      console.log("error deleting post", error)
    }
  }, [])

  return { deletePost }
}

export default useModals
