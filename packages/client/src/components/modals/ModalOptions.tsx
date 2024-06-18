import { FC, ReactNode, forwardRef } from "react"
import { Modal } from "./Modals"
import { cn } from "../../utils/utils"
import useModals from "./hooks/useModals"
import useModalStore from "../../stores/modalStore"
import { Link } from "react-router-dom"
import useUser from "../../hooks/useUser"

type ListProps = {
  children: ReactNode
  onClick?: () => void
  className?: string
}

const List: FC<ListProps> = ({ onClick, className, children }) => {
  return (
    <li
      onClick={onClick}
      className={cn(
        "w-full cursor-pointer bg-white bg-opacity-0 py-2 text-center font-semibold duration-100 hover:bg-opacity-[0.05]",
        className
      )}
    >
      {children}
    </li>
  )
}

const ModalOptions = forwardRef<HTMLUListElement>((_, ref) => {
  const { deletePost } = useModals()
  const { modalPostData } = useModalStore()
  const { userData } = useUser()
  return (
    <Modal>
      <ul ref={ref} className="h-max w-[90vw] max-w-[320px] rounded-lg bg-neutral-800">
        {userData?.id === modalPostData?.user_id && (
          <List onClick={() => deletePost()} className="text-red-500">
            Delete
          </List>
        )}
        {modalPostData && (
          <List>
            <Link to={modalPostData.media_url}>Download</Link>
          </List>
        )}
      </ul>
    </Modal>
  )
})

export default ModalOptions
